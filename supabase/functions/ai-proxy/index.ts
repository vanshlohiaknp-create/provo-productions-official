/**
 * PROVO AI PROXY — Supabase Edge Function (v2 — MCQ Generation)
 * ==============================================================
 * Routes:
 *   { action: 'chat',         model, max_tokens, system, messages }  → AI Concierge
 *   { action: 'generate_mcq', challenge_id, problem_statement }       → MCQ Generator
 *
 * Deploy:   supabase functions deploy ai-proxy
 * Secrets:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxx
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const ANTHROPIC_URL     = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const MODEL             = 'claude-sonnet-4-20250514'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://provo.io',
  'https://www.provo.io',
]

function cors(origin: string | null): Record<string, string> {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin':  o,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age':       '86400',
  }
}

function json(data: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  })
}

// ── MCQ Generation prompt ────────────────────────────────────────────────
function buildMCQPrompt(problemStatement: string): string {
  return `You are the Provo Competency Gate Engine. Your job is to generate exactly 20 multiple-choice questions that act as a competency barrier for the following challenge.

CHALLENGE BRIEF:
${problemStatement}

REQUIREMENTS:
- Generate exactly 20 questions. No more, no less.
- Questions must be directly relevant to the skills, domain knowledge, and concepts needed to solve THIS specific challenge.
- Each question must have exactly 4 options (A, B, C, D).
- Exactly one option must be correct.
- Questions must be technically rigorous — not trivial. A candidate who hasn't studied will fail.
- Include the core topic of each question.
- Vary difficulty: 4 easy (foundational), 10 medium (applied), 6 hard (expert-level).
- Include a one-sentence explanation of why the correct answer is right.

OUTPUT FORMAT:
Respond ONLY with a valid JSON array. No preamble, no markdown, no backticks. The array must be parseable by JSON.parse() immediately.

[
  {
    "id": "q1",
    "question": "...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "topic": "...",
    "difficulty": "easy|medium|hard",
    "explanation": "..."
  },
  ...20 total
]`
}

// ── Anthropic caller ─────────────────────────────────────────────────────
async function callAnthropic(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: unknown; status: number }> {
  const res = await fetch(ANTHROPIC_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return { ok: res.ok, data, status: res.status }
}

// ── ROUTE: generate_mcq ──────────────────────────────────────────────────
async function handleGenerateMCQ(
  payload:  { challenge_id: string; problem_statement: string },
  apiKey:   string,
  origin:   string | null,
): Promise<Response> {
  const { challenge_id, problem_statement } = payload

  // Strict validation — no silent success on empty state
  if (!challenge_id?.trim()) {
    return json({ error: 'CRITICAL: challenge_id is required.' }, 400, origin)
  }
  if (!problem_statement?.trim() || problem_statement.trim().length < 30) {
    return json({ error: 'CRITICAL: problem_statement must be at least 30 characters.' }, 400, origin)
  }

  const { ok, data, status } = await callAnthropic(apiKey, {
    model:      MODEL,
    max_tokens: 4000,
    messages:   [{ role: 'user', content: buildMCQPrompt(problem_statement) }],
  })

  if (!ok) {
    const errMsg = (data as Record<string, unknown>)?.error?.['message'] ?? `Anthropic error ${status}`
    console.error(`[ai-proxy/generate_mcq] Anthropic error ${status}:`, errMsg)
    return json({ error: `AI generation failed: ${errMsg}` }, status, origin)
  }

  // Extract text content
  const raw = ((data as Record<string, unknown>)?.content as Array<{ type: string; text: string }>)?.[0]?.text

  if (!raw?.trim()) {
    console.error('[ai-proxy/generate_mcq] Empty content from Anthropic')
    return json({ error: 'CRITICAL: AI returned empty response — MCQ generation failed.' }, 502, origin)
  }

  // Parse JSON — strict
  let questions: unknown[]
  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    questions = JSON.parse(cleaned)
  } catch (e) {
    console.error('[ai-proxy/generate_mcq] JSON parse failed:', e, '\nRaw:', raw.slice(0, 300))
    return json({ error: 'CRITICAL: AI response was not valid JSON. Retrying is recommended.' }, 502, origin)
  }

  if (!Array.isArray(questions) || questions.length !== 20) {
    console.error(`[ai-proxy/generate_mcq] Expected 20 questions, got ${Array.isArray(questions) ? questions.length : 'non-array'}`)
    return json({ error: `CRITICAL: Expected 20 questions, received ${Array.isArray(questions) ? questions.length : 'invalid format'}.` }, 502, origin)
  }

  // Validate each question shape
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] as Record<string, unknown>
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
      return json({ error: `CRITICAL: Question ${i + 1} has invalid structure.` }, 502, origin)
    }
  }

  return json({ success: true, challenge_id, questions }, 200, origin)
}

// ── ROUTE: chat ──────────────────────────────────────────────────────────
async function handleChat(
  payload: Record<string, unknown>,
  apiKey:  string,
  origin:  string | null,
): Promise<Response> {
  const { model, max_tokens, system, messages } = payload

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'CRITICAL: messages array is required and must not be empty.' }, 400, origin)
  }

  const { ok, data, status } = await callAnthropic(apiKey, {
    model:      model ?? MODEL,
    max_tokens: typeof max_tokens === 'number' ? Math.min(max_tokens, 1000) : 400,
    ...(system ? { system } : {}),
    messages,
  })

  if (!ok) {
    const errMsg = (data as Record<string, unknown>)?.error?.['message'] ?? `Anthropic error ${status}`
    console.error(`[ai-proxy/chat] Anthropic error ${status}:`, errMsg)
    return json({ error: errMsg }, status, origin)
  }

  return json(data, 200, origin)
}

// ── Main handler ─────────────────────────────────────────────────────────
serve(async (req: Request) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    console.error('[ai-proxy] ANTHROPIC_API_KEY secret not set')
    return json({ error: 'AI service not configured — set ANTHROPIC_API_KEY in Supabase secrets.' }, 503, origin)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400, origin)
  }

  // Route by action
  const action = body.action as string | undefined

  if (action === 'generate_mcq') {
    return handleGenerateMCQ(
      body as { challenge_id: string; problem_statement: string },
      apiKey,
      origin,
    )
  }

  // Default: chat proxy
  return handleChat(body, apiKey, origin)
})
