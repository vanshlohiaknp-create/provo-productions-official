/**
 * PROVO MCQ GENERATOR — Client-side orchestrator
 * ================================================
 * Calls the ai-proxy Edge Function with action:'generate_mcq'.
 * Caches generated questions in sessionStorage keyed by challenge_id.
 * Falls back to topic-matched static questions if proxy is unconfigured.
 */

import type { MCQQuestion } from '@/types'
import { MCQ_QUESTIONS } from '@/data/mcq'

const AI_PROXY_URL  = import.meta.env.VITE_AI_PROXY_URL as string | undefined
const CACHE_PREFIX  = 'provo_mcq_gate_'
const PASS_PREFIX   = 'provo_gate_passed_'
export const PASS_SCORE = 14

// ── Types ─────────────────────────────────────────────────────────────────
export type GenerationStatus =
  | 'idle'
  | 'loading'
  | 'cached'
  | 'generated'
  | 'fallback'
  | 'error'

export interface GenerationResult {
  status:     GenerationStatus
  questions:  MCQQuestion[]
  source:     'ai' | 'static' | 'cache'
  error?:     string
}

// ── Gate pass record ──────────────────────────────────────────────────────
export interface GatePassRecord {
  challengeId: string
  score:        number
  total:        number
  passedAt:     string
}

// ── Cache helpers ─────────────────────────────────────────────────────────
function cacheKey(challengeId: string)  { return `${CACHE_PREFIX}${challengeId}` }
function passKey(challengeId: string)   { return `${PASS_PREFIX}${challengeId}` }

export function getCachedQuestions(challengeId: string): MCQQuestion[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(challengeId))
    if (!raw) return null
    const qs = JSON.parse(raw) as MCQQuestion[]
    if (!Array.isArray(qs) || qs.length !== 20) return null
    return qs
  } catch {
    return null
  }
}

function setCachedQuestions(challengeId: string, questions: MCQQuestion[]) {
  try {
    sessionStorage.setItem(cacheKey(challengeId), JSON.stringify(questions))
  } catch {
    // Storage quota exceeded — non-fatal
  }
}

// ── Gate pass state ───────────────────────────────────────────────────────
export function hasPassedGate(challengeId: string): boolean {
  try {
    const raw = sessionStorage.getItem(passKey(challengeId))
    if (!raw) return false
    const rec = JSON.parse(raw) as GatePassRecord
    return rec.challengeId === challengeId && rec.score >= PASS_SCORE
  } catch {
    return false
  }
}

export function recordGatePass(challengeId: string, score: number) {
  try {
    const rec: GatePassRecord = {
      challengeId,
      score,
      total:    20,
      passedAt: new Date().toISOString(),
    }
    sessionStorage.setItem(passKey(challengeId), JSON.stringify(rec))
  } catch {
    // Non-fatal
  }
}

export function getGatePassRecord(challengeId: string): GatePassRecord | null {
  try {
    const raw = sessionStorage.getItem(passKey(challengeId))
    return raw ? (JSON.parse(raw) as GatePassRecord) : null
  } catch {
    return null
  }
}

// ── Orphan detector — used by Guardian ────────────────────────────────────
/**
 * Returns challenge IDs that were submitted for generation but have no
 * cached questions after 60 seconds (indicating a generation failure).
 */
const pendingGeneration = new Map<string, number>() // challengeId → timestamp

export function markGenerationPending(challengeId: string) {
  pendingGeneration.set(challengeId, Date.now())
}

export function clearGenerationPending(challengeId: string) {
  pendingGeneration.delete(challengeId)
}

export function getOrphanedChallenges(): string[] {
  const orphans: string[] = []
  const TIMEOUT_MS = 120_000 // 2 minutes — if still pending, it's orphaned
  const now = Date.now()
  for (const [id, ts] of pendingGeneration.entries()) {
    const cached = getCachedQuestions(id)
    if (!cached && now - ts > TIMEOUT_MS) {
      orphans.push(id)
    }
  }
  return orphans
}

// ── Fallback: static question pool matched to challenge tags ──────────────
function getStaticFallback(problemStatement: string): MCQQuestion[] {
  const lower = problemStatement.toLowerCase()
  const isMarketing = /market|brand|campaign|social|seo|growth|advertis/.test(lower)
  const isFinance   = /finance|invest|budget|revenue|profit|equity|cash/.test(lower)
  const pool        = isMarketing ? MCQ_QUESTIONS.marketing : isFinance ? MCQ_QUESTIONS.finance : MCQ_QUESTIONS.business
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 20)
}

// ── MAIN: generateChallengeMCQ ────────────────────────────────────────────
/**
 * Core generation function. Called when a student clicks "Solve".
 * 1. Returns cached questions immediately if available
 * 2. Calls Edge Function to generate AI questions
 * 3. Falls back to static pool if proxy unconfigured
 */
export async function generateChallengeMCQ(
  challengeId:      string,
  problemStatement: string,
  onProgress?:      (status: GenerationStatus) => void,
): Promise<GenerationResult> {
  // 1. Return cache hit instantly
  const cached = getCachedQuestions(challengeId)
  if (cached) {
    onProgress?.('cached')
    return { status: 'cached', questions: cached, source: 'cache' }
  }

  // 2. Validate inputs strictly — no silent success on broken state
  if (!challengeId?.trim()) {
    return { status: 'error', questions: [], source: 'static', error: 'CRITICAL: challengeId is required.' }
  }
  if (!problemStatement?.trim() || problemStatement.trim().length < 30) {
    return {
      status: 'error', questions: [], source: 'static',
      error: 'CRITICAL: problemStatement must be at least 30 characters.',
    }
  }

  // 3. No proxy → static fallback immediately
  if (!AI_PROXY_URL) {
    const qs = getStaticFallback(problemStatement)
    setCachedQuestions(challengeId, qs)
    onProgress?.('fallback')
    return {
      status:    'fallback',
      questions: qs,
      source:    'static',
      error:     'AI proxy not configured. Using static question pool. Add VITE_AI_PROXY_URL to enable AI-generated gates.',
    }
  }

  // 4. Call Edge Function
  onProgress?.('loading')
  markGenerationPending(challengeId)

  try {
    const res = await fetch(AI_PROXY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        action:            'generate_mcq',
        challenge_id:      challengeId,
        problem_statement: problemStatement,
      }),
      signal: AbortSignal.timeout(45_000), // 45s — AI generation takes time
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(err?.error ?? `Edge Function returned ${res.status}`)
    }

    const data = await res.json()

    // Strict: validate questions array before caching
    if (!data?.questions || !Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error(`Invalid response: expected 20 questions, got ${Array.isArray(data?.questions) ? data.questions.length : 'none'}`)
    }

    const questions = data.questions as MCQQuestion[]
    setCachedQuestions(challengeId, questions)
    clearGenerationPending(challengeId)
    onProgress?.('generated')
    return { status: 'generated', questions, source: 'ai' }

  } catch (err: unknown) {
    clearGenerationPending(challengeId)
    const errMsg = (err as Error)?.message ?? 'Unknown generation error'

    // Fallback to static on any failure
    const fallbackQs = getStaticFallback(problemStatement)
    setCachedQuestions(challengeId, fallbackQs)
    onProgress?.('fallback')
    return {
      status:    'fallback',
      questions: fallbackQs,
      source:    'static',
      error:     `AI generation failed: ${errMsg}. Using static fallback pool.`,
    }
  }
}
