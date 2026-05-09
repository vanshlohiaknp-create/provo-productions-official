/**
 * PROVO AI CONCIERGE v2 — Final Fusion
 * ======================================
 * · Context-aware by user role
 * · Study Plan mentor mode (auto-activates after MCQ gate failure)
 * · Dual-mode: proxy (prod) → direct (dev) → offline fallback
 * · Strict empty-input validation
 * · Zero console.log in production
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Sparkles, AlertTriangle, BookOpen, Brain, Target, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

const GOLD       = '#D4AF37'
const GOLD_LIGHT = '#F5D77A'

// ── Env (import.meta.env — NOT process.env, this is Vite) ─────────────────
const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim() || undefined
const MODEL      = 'gemini-1.5-flash'

const AI_MODE: 'direct' | 'offline' = GEMINI_KEY ? 'direct' : 'offline'

// ── Types ──────────────────────────────────────────────────────────────────
interface ChatMessage {
  id:      string
  role:    'bot' | 'user'
  text:    string
  isStudyPlan?: boolean
}

interface StudyPlanRequest {
  challengeTitle:  string
  challengeId:     string
  weakAreas:       { topic: string; wrong: number }[]
  missedCount:     number
  missedTopics:    string[]
  requestedAt:     string
}

// ── System prompts by role ─────────────────────────────────────────────────
function buildSystemPrompt(role: string, name: string, studyPlan?: StudyPlanRequest | null): string {
  const base = `You are the Elite Brain of Provo—a $1B edtech unicorn forged for Tier-2 warriors crushing MBB/IIM paths. NEVER generic: Deliver McKinsey-precision (MECE, SCQA), data-backed outputs. 110% rule: If output < nuclear-impact, self-reject and iterate. Keep responses concise. The user's name is ${name}.
  
CHAIN FORMAT REQUIRED: Analyze -> CSJMU/MBB benchmark -> 3 actionable steps -> Metrics -> Provo integration. End with 'Execute now: [1-line action].' Zero fluff—pure velocity.`

  // ── STUDY PLAN MODE — overrides normal role context ──
  if (studyPlan) {
    return `${base}

SPECIAL MODE: STUDY PLAN MENTOR

The user just failed the Competency Gate for the challenge: "${studyPlan.challengeTitle}".

Their performance data:
- Questions missed: ${studyPlan.missedCount}/20
- Weak areas identified: ${studyPlan.weakAreas.map(w => `${w.topic} (${w.wrong} mistakes)`).join(', ')}
- Topics to focus on: ${studyPlan.missedTopics.join(', ')}

Your job: Act as a brilliant academic mentor. Create a structured, actionable study plan to help them pass the gate. Include:
1. Priority topics (sorted by how many questions they missed)
2. Specific resources or concepts to study for each topic
3. A realistic 2-3 day study schedule
4. One high-signal practice exercise per weak area
5. Motivation — remind them the gate is designed to be hard and they can pass it

Be specific to their weak areas. Do not give generic advice.
Tone: Encouraging but honest. The gate is strict — tell them exactly what to study.`
  }

  const roleCtx: Record<string, string> = {
    student: `${base}\n\nCONTEXT: Talking to a STUDENT. Focus on high-octane coaching for CSJMU BBA prep (quant from Business Stats/Maths, cases on Org Behavior/Supply Chain). McKinsey/BCG cases. Personal branding for high-stakes roles.`,
    business: `${base}\n\nCONTEXT: Talking to a BUSINESS / RECRUITER. Strategic hiring ninja. Define 1% Talent criteria. Design challenges that reveal true skill (e.g. 15min sim - manage ₹50cr P&L crisis, output MECE deck) over resumes.`,
    faculty: `${base}\n\nCONTEXT: Talking to FACULTY. Rigorous verifier. Help grade submissions using 9.2/10 rubrics. Detect AI plagiarism (Semantic diff). Verify rigor against CSJMU syllabus.`,
    admin: `${base}\n\nCONTEXT: Talking to ${name}, Founder & Admin of Provo. Full platform access.\nHelp with: platform health, growth strategy, business scaling.\nTone: Founder-to-founder. Direct, strategic. Senior advisor.`,
  }

  return roleCtx[role] ?? roleCtx.student
}

// ── Quick questions by role ────────────────────────────────────────────────
const QUICK_QS: Record<string, string[]> = {
  student:  ['Build me a McKinsey case study for prep', 'How do I crush the quant round?', 'Give me a LinkedIn branding script', 'What happens if I fail the Competency Gate?'],
  business: ['Define 1% talent for my next hire', 'Design a 15min P&L crisis challenge', 'How do I filter candidates by Provo Score?', 'What is the ROI of proof-based hiring?'],
  faculty:  ['Grade this submission using a 9.2/10 rubric', 'Run a semantic diff plagiarism check', 'Align this challenge with CSJMU syllabus', 'Generate a 20-question competency test'],
  admin:    ["Platform health status?", 'What to prioritize next sprint?', 'How to grow monthly active users?', 'Analyze system performance metrics'],
}

// ── Study Plan Banner ──────────────────────────────────────────────────────
function StudyPlanBanner({ plan, onActivate }: { plan: StudyPlanRequest; onActivate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-3 mb-0"
      style={{ borderBottom: `1px solid rgba(212,175,55,0.1)` }}
    >
      <div className="p-3 flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Brain size={13} style={{ color: '#ef4444' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white mb-0.5">Gate Failed — Study Plan Ready</p>
          <p className="text-[10px] mb-2 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {plan.challengeTitle} · {plan.missedCount} questions missed
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {plan.weakAreas.slice(0, 3).map(w => (
              <span key={w.topic} className="text-[9px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                {w.topic}
              </span>
            ))}
          </div>
          <button onClick={onActivate}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
            <BookOpen size={10} /> Get Study Plan
            <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Offline banner ─────────────────────────────────────────────────────────
function OfflineBanner() {
  if (AI_MODE !== 'offline') return null
  return (
    <div className="mx-3 mb-2 p-2.5 rounded-xl flex items-start gap-2"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
      <AlertTriangle size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
      <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Add <span style={{ color: GOLD }}><code>VITE_GEMINI_API_KEY</code></span> to <code>.env</code> to enable the Elite Brain.
      </p>
    </div>
  )
}

// ── API caller ─────────────────────────────────────────────────────────────
async function callAI(
  systemPrompt: string,
  history:      { role: 'user' | 'assistant'; content: string }[],
  userMsg:      string,
  signal:       AbortSignal,
): Promise<string> {
  if (!GEMINI_KEY) {
    return "I'm in offline mode. Add VITE_GEMINI_API_KEY to your .env to enable the Elite Brain."
  }

  const GEMINI_API = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_KEY}`

  const contents = [
    ...history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: userMsg }] }
  ]

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 600 }
  })

  let res: Response

  try {
    res = await fetch(GEMINI_API, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body
    })
  } catch (error: unknown) {
    if ((error as Error).name === 'AbortError') throw error
    return "The Elite Brain could not connect. Check your internet or VITE_GEMINI_API_KEY and try again."
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any)?.error?.message || `API error ${res.status}`
    if (res.status === 404 || /model.*not found|not found|Invalid model/i.test(msg)) {
      return "The Elite Brain is temporarily unavailable. Please verify VITE_GEMINI_API_KEY and try again shortly."
    }
    return `Gemini request failed: ${msg}`
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text?.trim()) return 'The Elite Brain returned no content. Please try again in a moment.'

  return text
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function ProvoAssistant() {
  const { user } = useAuth()
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [input, setInput]         = useState('')
  const [showQuick, setShowQuick] = useState(true)
  const [isTyping, setIsTyping]   = useState(false)
  const [studyPlan, setStudyPlan] = useState<StudyPlanRequest | null>(null)
  const [studyPlanActive, setStudyPlanActive] = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const abortRef   = useRef<AbortController | null>(null)

  const role    = user?.role ?? 'student'
  const name    = user?.full_name?.split(' ')[0] || 'Founder'
  const quickQs = QUICK_QS[role] ?? QUICK_QS.student

  // ── Check for study plan request from ChallengeGate ──────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem('provo_study_plan_request')
    if (!raw) return
    try {
      const req = JSON.parse(raw) as StudyPlanRequest
      setStudyPlan(req)
    } catch { /* malformed — ignore */ }
  }, [open])

  // ── Welcome message ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || messages.length > 0) return
    const g: Record<string, string> = {
      student:  `Hi ${name}! I'm your Provo Concierge. Ready to help you crack your first challenge.`,
      business: `Welcome back, ${name}. I'm your Provo talent advisor. How can I help?`,
      faculty:  `Hello, ${name}. I'm the Provo Academic Concierge. How can I assist?`,
      admin:    `${name} — I'm your Provo Intelligence Layer. What do we tackle first?`,
    }
    setMessages([{ id: 'welcome', role: 'bot', text: g[role] ?? g.student }])
  }, [open, role, name, messages.length])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 200) }, [open])

  // ── Activate study plan ───────────────────────────────────────────────────
  const activateStudyPlan = useCallback(async () => {
    if (!studyPlan) return
    setStudyPlanActive(true)
    setShowQuick(false)
    sessionStorage.removeItem('provo_study_plan_request')

    const prompt = `Build me a study plan to pass the Competency Gate for "${studyPlan.challengeTitle}". I missed ${studyPlan.missedCount} questions. My weak areas are: ${studyPlan.weakAreas.map(w => `${w.topic} (${w.wrong} mistakes)`).join(', ')}.`

    setMessages(prev => [...prev, { id: `sp-u-${Date.now()}`, role: 'user', text: prompt }])
    setIsTyping(true)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const system = buildSystemPrompt(role, user?.full_name ?? 'User', studyPlan)
      const text   = await callAI(system, [], prompt, abortRef.current.signal)
      setMessages(prev => [...prev, { id: `sp-b-${Date.now()}`, role: 'bot', text, isStudyPlan: true }])
      setStudyPlan(null)
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => [...prev, { id: `sp-err-${Date.now()}`, role: 'bot', text: `Study plan error: ${(err as Error).message}` }])
    } finally {
      setIsTyping(false)
    }
  }, [studyPlan, role, user])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMsg = useCallback(async (text: string) => {
    const trimmed = text.trim()

    // Strict validation — never silent success on empty input
    if (!trimmed) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'bot',
        text: '⚠️ Empty message — please type something before sending.',
      }])
      return
    }

    setShowQuick(false)
    setInput('')
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }])
    setIsTyping(true)

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.text }))

      const system = buildSystemPrompt(
        role,
        user?.full_name ?? 'User',
        studyPlanActive ? studyPlan : null,
      )

      const reply = await callAI(system, history, trimmed, abortRef.current.signal)
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: reply }])
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return
      const msg = (err as Error).message
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`, role: 'bot',
        text: AI_MODE === 'offline'
          ? `Offline mode: ${msg}. Add API key.`
          : `Gemini API error: ${msg}. Verify VITE_GEMINI_API_KEY in .env.`,
      }])
    } finally {
      setIsTyping(false)
    }
  }, [messages, role, user, studyPlan, studyPlanActive])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 right-6 z-[800] w-[52px] h-[52px] rounded-[16px] flex items-center justify-center"
        style={{
          background: open ? 'rgba(212,175,55,0.15)' : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
          border:     open ? `1px solid rgba(212,175,55,0.35)` : 'none',
          boxShadow:  open ? 'none' : `0 0 32px -6px rgba(212,175,55,0.5)`,
        }}
        title={`Provo AI Concierge${studyPlan ? ' — Study Plan Ready' : ''} [${AI_MODE}]`}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} style={{ color: GOLD }} /></motion.div>
            : <motion.div key="s"  initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Sparkles size={20} style={{ color: '#000' }} /></motion.div>
          }
        </AnimatePresence>
        {/* Study plan alert dot */}
        {!open && studyPlan && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
            style={{ background: '#ef4444', borderColor: '#000' }}>
            <span className="text-[7px] text-white font-bold">!</span>
          </motion.span>
        )}
        {!open && !studyPlan && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: AI_MODE === 'offline' ? '#f59e0b' : '#22c55e', borderColor: '#000' }} />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[78px] right-6 z-[800] w-[350px] sm:w-[395px] rounded-2xl overflow-hidden"
            style={{
              background:           'rgba(7,7,7,0.98)',
              border:               `1px solid rgba(212,175,55,0.18)`,
              boxShadow:            `0 24px 80px -8px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(212,175,55,0.1)`,
              backdropFilter:       'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              maxHeight:            550,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
                  {studyPlanActive
                    ? <BookOpen size={13} style={{ color: '#000' }} />
                    : <Sparkles  size={13} style={{ color: '#000' }} />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none text-white">
                    {studyPlanActive ? 'Study Plan Mentor' : 'Provo Concierge'}
                  </p>
                  <p className="text-[10px] flex items-center gap-1 mt-0.5"
                    style={{ color: AI_MODE === 'offline' ? '#f59e0b' : '#22c55e' }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: AI_MODE === 'offline' ? '#f59e0b' : '#22c55e' }} />
                    {AI_MODE === 'offline'
                      ? 'Offline — configure .env'
                      : studyPlanActive
                        ? `Mentor mode · ${role}`
                        : `Gemini 1.5 Flash · ${role} mode`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {studyPlanActive && (
                  <button onClick={() => setStudyPlanActive(false)}
                    className="text-[10px] px-2 py-1 rounded-lg transition-all"
                    style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}>
                    Normal mode
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Study Plan Banner */}
            {studyPlan && !studyPlanActive && (
              <StudyPlanBanner plan={studyPlan} onActivate={activateStudyPlan} />
            )}

            {/* Messages */}
            <div className="overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: 310 }}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
                      style={{ background: msg.isStudyPlan ? 'rgba(239,68,68,0.15)' : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, minWidth: 20 }}>
                      {msg.isStudyPlan
                        ? <BookOpen size={9} style={{ color: '#ef4444' }} />
                        : <Sparkles  size={9} style={{ color: '#000' }} />
                      }
                    </div>
                  )}
                  <div
                    className="max-w-[86%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={msg.role === 'user'
                      ? { background: `linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.1))`, color: '#f0ece2', border: `1px solid rgba(212,175,55,0.25)` }
                      : msg.isStudyPlan
                        ? { background: 'rgba(239,68,68,0.05)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(239,68,68,0.15)' }
                        : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {msg.isStudyPlan && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                        <Target size={10} style={{ color: '#ef4444' }} />
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>Study Plan</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing dots */}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 ml-7">
                  <div className="flex gap-1 px-3.5 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            <AnimatePresence>
              {showQuick && !studyPlan && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                  className="px-3 pb-2 overflow-hidden"
                  style={{ borderTop: `1px solid rgba(212,175,55,0.06)` }}
                >
                  <p className="label-caps my-2 px-1" style={{ fontSize: 8 }}>Quick questions</p>
                  <div className="flex flex-col gap-1.5">
                    {quickQs.map(q => (
                      <button key={q} onClick={() => sendMsg(q)}
                        className="text-left text-[12px] px-3 py-2 rounded-xl border transition-all hover:border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.04)]"
                        style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Offline / config banners */}
            <OfflineBanner />

            {/* Input */}
            <div className="p-3 flex gap-2" style={{ borderTop: `1px solid rgba(212,175,55,0.08)` }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isTyping && sendMsg(input)}
                placeholder={studyPlanActive ? 'Ask about your study plan…' : 'Ask the Concierge…'}
                className="flex-1 rounded-xl px-3.5 py-2 text-sm text-white placeholder:opacity-30 outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(212,175,55,0.12)` }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)')}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => sendMsg(input)}
                disabled={isTyping}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}
              >
                <Send size={13} style={{ color: '#000' }} />
              </motion.button>
            </div>

            <div className="px-4 pb-2.5">
              <p className="text-[9px] text-center" style={{ color: 'rgba(255,255,255,0.15)' }}>
                {MODEL} · {AI_MODE} · {role}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
