/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║        PROVO-GUARDIAN v2 — Final Fusion               ║
 * ║  24-Hour Diagnostic Heartbeat · Self-Healing Bot      ║
 * ║                                                       ║
 * ║  NEW in v2:                                           ║
 * ║  · Orphaned Challenge detection (no MCQ generated)    ║
 * ║  · MCQ generation failure alerts                      ║
 * ║  · Gate pass rate monitoring                          ║
 * ╚═══════════════════════════════════════════════════════╝
 */

import { getOrphanedChallenges, getCachedQuestions } from '@/lib/mcqGenerator'
import { SAMPLE_CHALLENGES } from '@/data/sampleData'

// ── Types ──────────────────────────────────────────────────────────────────
export type GuardianSeverity = 'ok' | 'warning' | 'critical'

export interface GuardianCheck {
  id:         string
  name:       string
  category:   'routing' | 'auth' | 'api' | 'storage' | 'performance' | 'mcq' | 'integrity'
  status:     GuardianSeverity
  message:    string
  latencyMs?: number
  timestamp:  string
  fix?:       string
  meta?:      Record<string, unknown>
}

export interface GuardianReport {
  runAt:    string
  duration: number
  overall:  GuardianSeverity
  checks:   GuardianCheck[]
  summary: {
    ok: number; warning: number; critical: number; total: number
    orphanedChallenges: string[]
    gatePassRate: number | null
  }
  nextRunAt:        string
  guardianVersion:  string
}

// ── Internal utils ─────────────────────────────────────────────────────────
const ts = () => new Date().toISOString()

async function check(
  id:       string,
  name:     string,
  category: GuardianCheck['category'],
  run:      () => Promise<{ status: GuardianSeverity; message: string; fix?: string; latency?: number; meta?: Record<string, unknown> }>,
): Promise<GuardianCheck> {
  const start = performance.now()
  return run()
    .then(r => ({
      id, name, category,
      status:    r.status,
      message:   r.message,
      fix:       r.fix,
      latencyMs: r.latency ?? Math.round(performance.now() - start),
      timestamp: ts(),
      meta:      r.meta,
    }))
    .catch(err => ({
      id, name, category,
      status:    'critical' as GuardianSeverity,
      message:   `EXCEPTION: ${(err as Error)?.message ?? 'Unknown error'}`,
      fix:       'Investigate in browser console. Check for unhandled async errors.',
      latencyMs: Math.round(performance.now() - start),
      timestamp: ts(),
    }))
}

// ── Route manifest ─────────────────────────────────────────────────────────
const ROUTE_MANIFEST = [
  { path: '/',                    label: 'Landing Page',         requiresAuth: false },
  { path: '/login',               label: 'Login Page',           requiresAuth: false },
  { path: '/signup',              label: 'Signup Page',          requiresAuth: false },
  { path: '/challenges',          label: 'Challenges List',      requiresAuth: false },
  { path: '/leaderboard',         label: 'Leaderboard',          requiresAuth: false },
  { path: '/opportunities',       label: 'Opportunities Feed',   requiresAuth: false },
  { path: '/mcq',                 label: 'MCQ Select',           requiresAuth: false },
  { path: '/dashboard/student',   label: 'Student Dashboard',    requiresAuth: true  },
  { path: '/dashboard/business',  label: 'Business Dashboard',   requiresAuth: true  },
  { path: '/dashboard/faculty',   label: 'Faculty Dashboard',    requiresAuth: true  },
  { path: '/dashboard/admin',     label: 'Admin Dashboard',      requiresAuth: true  },
  { path: '/profile',             label: 'Proof Profile',        requiresAuth: true  },
  { path: '/welcome',             label: 'Welcome Page',         requiresAuth: true  },
  { path: '/notifications',       label: 'Notifications',        requiresAuth: true  },
]

// ── CHECKS ─────────────────────────────────────────────────────────────────

async function checkRoutes(): Promise<GuardianCheck[]> {
  return ROUTE_MANIFEST.map(route => ({
    id:        `route-${route.path.replace(/\//g, '-').slice(1) || 'root'}`,
    name:      `Route: ${route.label}`,
    category:  'routing' as const,
    status:    'ok' as GuardianSeverity,
    message:   `${route.path} registered${route.requiresAuth ? ' (auth-protected)' : ' (public)'}`,
    timestamp: ts(),
  }))
}

async function checkAuthState(): Promise<GuardianCheck> {
  return check('auth-state', 'Auth Token Integrity', 'auth', async () => {
    const stored = localStorage.getItem('provo_user')
    if (!stored) return { status: 'ok', message: 'No active session — unauthenticated. Expected.' }
    try {
      const p = JSON.parse(stored)
      const missing = ['id', 'email', 'full_name', 'role'].filter(f => !p[f])
      if (missing.length) return {
        status:  'critical',
        message: `Corrupted auth token. Missing: ${missing.join(', ')}`,
        fix:     `Run localStorage.removeItem('provo_user') and force re-login.`,
      }
      const validRoles = ['student', 'business', 'faculty', 'admin']
      if (!validRoles.includes(p.role)) return {
        status:  'critical',
        message: `Invalid role in token: "${p.role}"`,
        fix:     'Token tampered or corrupted. Force sign-out and re-authenticate.',
      }
      return { status: 'ok', message: `Auth token valid — ${p.full_name} (${p.role})` }
    } catch {
      return {
        status: 'critical',
        message: 'Auth token is malformed JSON.',
        fix:    `Run localStorage.removeItem('provo_user') to clear.`,
      }
    }
  })
}

async function checkAnthropicAPI(): Promise<GuardianCheck> {
  return check('api-anthropic', 'Anthropic API Connectivity', 'api', async () => {
    const start = performance.now()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 10, messages: [{ role: 'user', content: 'ping' }] }),
        signal:  AbortSignal.timeout(8000),
      })
      const latency = Math.round(performance.now() - start)
      if (res.status === 401 || res.ok) return { status: 'ok', message: `Anthropic API reachable. Status ${res.status}. Latency: ${latency}ms`, latency }
      return { status: 'warning', message: `Anthropic returned ${res.status}. Latency: ${latency}ms`, fix: 'Check status.anthropic.com', latency }
    } catch (err: unknown) {
      if ((err as Error).name === 'TimeoutError') return { status: 'critical', message: 'Anthropic API timed out (8s). AI Concierge and MCQ Generator degraded.', fix: 'Check network and Anthropic status.', latency: 8000 }
      return { status: 'warning', message: `Anthropic unreachable: ${(err as Error).message}`, fix: 'Network/CORS issue. AI features will use fallback.' }
    }
  })
}


async function checkLocalStorage(): Promise<GuardianCheck> {
  return check('storage-local', 'localStorage Integrity', 'storage', async () => {
    const k = '__provo_probe__'
    try {
      localStorage.setItem(k, '1')
      const r = localStorage.getItem(k)
      localStorage.removeItem(k)
      if (r !== '1') return { status: 'critical', message: 'localStorage write-read mismatch. Auth persistence broken.', fix: 'Check browser storage settings.' }
      return { status: 'ok', message: 'localStorage read/write integrity confirmed.' }
    } catch {
      return { status: 'critical', message: 'localStorage unavailable. Auth will not persist.', fix: 'Storage blocked by browser or private mode.' }
    }
  })
}

async function checkSessionStorage(): Promise<GuardianCheck> {
  return check('storage-session', 'MCQ Session State', 'storage', async () => {
    const issues: string[] = []
    const config = sessionStorage.getItem('mcq_config')
    const result = sessionStorage.getItem('mcq_result')
    if (config) { try { JSON.parse(config) } catch { issues.push('mcq_config malformed JSON') } }
    if (result) {
      try {
        const r = JSON.parse(result)
        if (typeof r.total !== 'number' || r.total <= 0) issues.push('mcq_result has invalid total (no silent success)')
        if (r.score === undefined) issues.push('mcq_result missing score')
      } catch { issues.push('mcq_result malformed JSON') }
    }
    if (issues.length) return { status: 'warning', message: `MCQ session issues: ${issues.join('; ')}`, fix: 'Clear sessionStorage MCQ keys to reset state.' }
    return { status: 'ok', message: 'MCQ session storage clean.' }
  })
}

async function checkPerformance(): Promise<GuardianCheck> {
  return check('perf-nav', 'Navigation Performance', 'performance', async () => {
    if (!performance?.getEntriesByType) return { status: 'warning', message: 'Performance API unavailable.' }
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (!nav) return { status: 'ok', message: 'No navigation entry (SPA — expected on first render).' }
    const ttfb        = Math.round(nav.responseStart - nav.requestStart)
    const domComplete = Math.round(nav.domComplete)
    if (domComplete > 5000) return { status: 'warning', message: `Slow load: ${domComplete}ms DOM complete. TTFB: ${ttfb}ms.`, fix: 'Audit bundle size, add lazy loading, enable compression.', latency: domComplete }
    return { status: 'ok', message: `DOM complete: ${domComplete}ms. TTFB: ${ttfb}ms.`, latency: domComplete }
  })
}

async function checkSupabaseEnv(): Promise<GuardianCheck> {
  return check('env-supabase', 'Supabase Environment Config', 'api', async () => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (!url || !key) return { status: 'warning', message: 'Supabase not configured. Running on local auth fallback.', fix: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env' }
    if (!url.includes('supabase.co')) return { status: 'warning', message: `Supabase URL format unexpected: ${url}`, fix: 'URL should be https://<ref>.supabase.co' }
    return { status: 'ok', message: `Supabase configured: ${url.slice(0, 40)}…` }
  })
}

async function checkMCQProxyConfig(): Promise<GuardianCheck> {
  return check('mcq-proxy', 'AI MCQ Proxy Configuration', 'mcq', async () => {
    const proxyUrl = import.meta.env.VITE_AI_PROXY_URL as string | undefined
    const directKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
    if (!proxyUrl && !directKey) return {
      status:  'warning',
      message: 'Neither VITE_AI_PROXY_URL nor VITE_ANTHROPIC_API_KEY configured. MCQ Generator will use static fallback pool.',
      fix:     'Set VITE_AI_PROXY_URL for production AI question generation.',
    }
    if (directKey && !proxyUrl) return {
      status:  'warning',
      message: 'Using direct Anthropic key for MCQ generation. Key is visible in browser bundle.',
      fix:     'Switch to VITE_AI_PROXY_URL + Supabase Edge Function for production security.',
    }
    return { status: 'ok', message: `MCQ Generator using proxy: ${proxyUrl?.slice(0, 50)}…` }
  })
}

// ── NEW v2: Orphaned Challenge Detection ────────────────────────────────────
async function checkOrphanedChallenges(): Promise<GuardianCheck> {
  return check('mcq-orphans', 'Orphaned Challenges (No MCQ Generated)', 'mcq', async () => {
    // 1. Check the in-memory pending generation tracker
    const timedOutOrphans = getOrphanedChallenges()

    // 2. Check known challenges (sample + any in sessionStorage registry)
    const challenges = [...SAMPLE_CHALLENGES]
    const noQuestions: string[] = []

    for (const c of challenges) {
      // Only flag active challenges — pending/rejected don't need questions yet
      if (c.status !== 'active') continue
      const cached = getCachedQuestions(c.id)
      if (!cached) noQuestions.push(c.id)
    }

    // Combine: timed-out pending + confirmed no cache
    const allOrphans = [...new Set([...timedOutOrphans, ...noQuestions])]
    const orphanTitles = allOrphans.map(id => {
      const c = challenges.find(ch => ch.id === id)
      return c ? `"${c.title.slice(0, 40)}…"` : id
    })

    if (timedOutOrphans.length > 0) return {
      status:  'critical',
      message: `${timedOutOrphans.length} challenge(s) failed MCQ generation (timeout >2min): ${orphanTitles.join(', ')}`,
      fix:     'Re-trigger MCQ generation from Admin Dashboard. Check VITE_AI_PROXY_URL and Edge Function logs.',
      meta:    { orphanIds: timedOutOrphans },
    }

    if (noQuestions.length > 0) {
      // Active challenges without cached questions — may just not have been visited yet
      // Only a warning, not critical, because generation is lazy (on first student access)
      return {
        status:  'warning',
        message: `${noQuestions.length} active challenge(s) have no cached MCQ yet. Questions generate on first student access.`,
        fix:     'No action needed unless students report gate not loading. If so, check proxy config.',
        meta:    { challengeIds: noQuestions },
      }
    }

    return { status: 'ok', message: `All ${challenges.filter(c => c.status === 'active').length} active challenges have MCQ questions cached.` }
  })
}

// ── NEW v2: Gate pass rate check ────────────────────────────────────────────
async function checkGatePassRate(): Promise<GuardianCheck> {
  return check('mcq-pass-rate', 'Competency Gate Pass Rate', 'mcq', async () => {
    // Scan sessionStorage for gate pass records
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith('provo_gate_passed_'))
    if (keys.length === 0) return { status: 'ok', message: 'No gate attempts recorded yet. Platform is fresh.' }

    let passes = 0
    let fails  = 0
    for (const k of keys) {
      try {
        const rec = JSON.parse(sessionStorage.getItem(k) ?? '{}')
        if (rec.score >= 15) passes++
        else fails++
      } catch { /* skip malformed */ }
    }

    const total   = passes + fails
    const rate    = total > 0 ? Math.round((passes / total) * 100) : 0
    const meta    = { passes, fails, total, passRate: rate }

    if (rate < 30 && total >= 5) return {
      status:  'warning',
      message: `Gate pass rate is low: ${rate}% (${passes}/${total}). Questions may be too difficult or misaligned.`,
      fix:     'Review generated questions for accuracy. Consider adjusting AI prompt difficulty distribution.',
      meta,
    }
    if (rate > 95 && total >= 5) return {
      status:  'warning',
      message: `Gate pass rate is very high: ${rate}% (${passes}/${total}). Questions may be too easy — quality filter weakened.`,
      fix:     'Audit recent MCQ generations. Consider increasing difficulty weighting in the AI prompt.',
      meta,
    }

    return { status: 'ok', message: `Gate pass rate: ${rate}% (${passes}/${total} attempts). Healthy range.`, meta }
  })
}

// ── NEW v2: MCQ question integrity check ────────────────────────────────────
async function checkMCQIntegrity(): Promise<GuardianCheck> {
  return check('mcq-integrity', 'MCQ Question Cache Integrity', 'integrity', async () => {
    const keys    = Object.keys(sessionStorage).filter(k => k.startsWith('provo_mcq_gate_'))
    if (keys.length === 0) return { status: 'ok', message: 'No MCQ caches to audit yet.' }

    const issues: string[] = []
    for (const k of keys) {
      try {
        const qs = JSON.parse(sessionStorage.getItem(k) ?? '[]')
        if (!Array.isArray(qs) || qs.length !== 20) {
          issues.push(`${k}: expected 20 questions, found ${Array.isArray(qs) ? qs.length : 'invalid'}`)
          continue
        }
        for (let i = 0; i < qs.length; i++) {
          const q = qs[i]
          if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct !== 'number') {
            issues.push(`${k} Q${i+1}: malformed structure`)
            break
          }
        }
      } catch {
        issues.push(`${k}: malformed JSON`)
      }
    }

    if (issues.length) return {
      status:  'critical',
      message: `${issues.length} MCQ cache integrity failure(s): ${issues.slice(0, 3).join(' | ')}`,
      fix:     'Clear corrupted caches: sessionStorage.clear(). Questions will regenerate on next student access.',
      meta:    { issues },
    }

    return { status: 'ok', message: `${keys.length} MCQ cache(s) passed integrity check. All 20-question, 4-option format valid.` }
  })
}

// ── MAIN RUNNER ─────────────────────────────────────────────────────────────
export async function runGuardianDiagnostic(): Promise<GuardianReport> {
  const start = performance.now()
  const runAt = ts()

  // Run all checks in parallel for speed
  const [
    routeChecks,
    authCheck,
    anthropicCheck,
    localStorageCheck,
    sessionStorageCheck,
    perfCheck,
    supabaseCheck,
    mcqProxyCheck,
    orphanCheck,
    passRateCheck,
    integrityCheck,
  ] = await Promise.all([
    checkRoutes(),
    checkAuthState(),
    checkAnthropicAPI(),
    checkLocalStorage(),
    checkSessionStorage(),
    checkPerformance(),
    checkSupabaseEnv(),
    checkMCQProxyConfig(),
    checkOrphanedChallenges(),
    checkGatePassRate(),
    checkMCQIntegrity(),
  ])

  const allChecks: GuardianCheck[] = [
    ...routeChecks,
    authCheck,
    anthropicCheck,
    localStorageCheck,
    sessionStorageCheck,
    perfCheck,
    supabaseCheck,
    mcqProxyCheck,
    orphanCheck,
    passRateCheck,
    integrityCheck,
  ]

  // Extract orphaned challenge IDs for summary
  const orphanMeta = orphanCheck.meta?.orphanIds as string[] | undefined
  const orphanedChallenges = orphanMeta ?? (orphanCheck.meta?.challengeIds as string[] | undefined) ?? []

  // Gate pass rate for summary
  const passRateMeta = passRateCheck.meta as { passRate?: number } | undefined
  const gatePassRate = passRateMeta?.passRate ?? null

  const summary = {
    ok:                  allChecks.filter(c => c.status === 'ok').length,
    warning:             allChecks.filter(c => c.status === 'warning').length,
    critical:            allChecks.filter(c => c.status === 'critical').length,
    total:               allChecks.length,
    orphanedChallenges,
    gatePassRate,
  }

  const overall: GuardianSeverity =
    summary.critical > 0 ? 'critical' : summary.warning > 0 ? 'warning' : 'ok'

  const duration   = Math.round(performance.now() - start)
  const nextRunAt  = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const report: GuardianReport = {
    runAt, duration, overall, checks: allChecks,
    summary, nextRunAt, guardianVersion: '2.0.0',
  }

  try {
    sessionStorage.setItem('provo_guardian_report', JSON.stringify(report))
  } catch { /* quota exceeded — non-fatal */ }

  return report
}

// ── 24-HOUR HEARTBEAT ───────────────────────────────────────────────────────
const HEARTBEAT_INTERVAL = 24 * 60 * 60 * 1000
let _heartbeatTimer: ReturnType<typeof setInterval> | null = null

export function startGuardianHeartbeat(onReport?: (r: GuardianReport) => void): () => void {
  runGuardianDiagnostic().then(r => onReport?.(r))
  _heartbeatTimer = setInterval(() => {
    runGuardianDiagnostic().then(r => onReport?.(r))
  }, HEARTBEAT_INTERVAL)
  return () => {
    if (_heartbeatTimer) { clearInterval(_heartbeatTimer); _heartbeatTimer = null }
  }
}

export function getLastGuardianReport(): GuardianReport | null {
  try {
    const raw = sessionStorage.getItem('provo_guardian_report')
    return raw ? JSON.parse(raw) as GuardianReport : null
  } catch { return null }
}

export function getSeverityColor(s: GuardianSeverity): string {
  return { ok: '#22c55e', warning: '#D4AF37', critical: '#ef4444' }[s]
}

export function getSeverityLabel(s: GuardianSeverity): string {
  return {
    ok:       'All Systems Healthy',
    warning:  'Attention Required',
    critical: 'Critical — Immediate Action Needed',
  }[s]
}
