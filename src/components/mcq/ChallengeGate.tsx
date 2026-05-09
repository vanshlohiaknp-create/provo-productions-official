/**
 * CHALLENGE GATE COMPONENT
 * =========================
 * The Competency Gate for a specific challenge.
 * - Generates/fetches 20 AI questions for this challenge
 * - Strictly enforces 14/20 pass threshold
 * - Framer Motion celebration on pass
 * - Exposes missed questions for Study Plan
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Shield, ArrowLeft, ArrowRight, Clock, Lock, Unlock, Sparkles, Trophy, AlertTriangle } from 'lucide-react'
import { generateChallengeMCQ, recordGatePass, type GenerationStatus } from '@/lib/mcqGenerator'
import type { MCQQuestion, ChallengeGateResult } from '@/types'

const GOLD       = '#D4AF37'
const GOLD_LIGHT = '#F5D77A'
const PASS_SCORE = 14

// ── Confetti particle ──────────────────────────────────────────────────────
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none"
      style={{ left: `${x}%`, background: color, zIndex: 200 }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ y: 280, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0.3 }}
      transition={{ duration: 1.4 + Math.random() * 0.6, delay, ease: [0.2, 0.8, 0.4, 1] }}
    />
  )
}

// ── Pass celebration ───────────────────────────────────────────────────────
function PassCelebration({ score, onContinue }: { score: number; onContinue: () => void }) {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id:    i,
    x:     Math.random() * 100,
    delay: Math.random() * 0.5,
    color: [GOLD, GOLD_LIGHT, '#22c55e', '#fff', '#f0ece2'][Math.floor(Math.random() * 5)],
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col items-center text-center px-6 py-10 overflow-hidden"
    >
      {/* Confetti burst */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />)}
      </div>

      {/* Gold ambient glow */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
      />

      {/* Trophy icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
          boxShadow: `0 0 60px -8px rgba(212,175,55,0.7)`,
        }}
      >
        <Trophy size={38} style={{ color: '#000' }} />
        {/* Sparkle ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: GOLD }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 0] }}
          transition={{ duration: 1.2, repeat: 2, delay: 0.3 }}
        />
      </motion.div>

      {/* Score reveal */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-1"
      >
        <span className="font-display text-5xl font-bold" style={{ color: GOLD }}>{score}</span>
        <span className="font-display text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>/20</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
        style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}40` }}
      >
        <Unlock size={12} style={{ color: GOLD }} />
        <span className="label-caps" style={{ color: GOLD }}>Gate Unlocked</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="font-display text-2xl font-bold mb-2"
      >
        Competency Verified
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 340 }}
      >
        You've proven the foundational knowledge required for this challenge. The submission form is now unlocked.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.02, boxShadow: `0 0 40px -6px rgba(212,175,55,0.6)` }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2"
        style={{
          background:  `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
          color:       '#000',
          boxShadow:   `0 0 32px -6px rgba(212,175,55,0.5)`,
          letterSpacing: '0.03em',
        }}
      >
        Submit Your Solution <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  )
}

// ── Loading screen ─────────────────────────────────────────────────────────
function GeneratingScreen({ status }: { status: GenerationStatus }) {
  const msgs: Record<string, string> = {
    loading:   'Reading your challenge brief…',
    idle:      'Initialising the Competency Gate…',
  }
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 mb-6"
        style={{ borderColor: `${GOLD}40`, borderTopColor: GOLD }}
      />
      <p className="font-display text-lg font-semibold mb-2 text-white">
        {msgs[status] ?? 'Generating questions…'}
      </p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 300 }}>
        The AI is analysing this challenge and crafting 20 questions specific to its domain. This takes 10–20 seconds.
      </p>
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main Props ─────────────────────────────────────────────────────────────
interface ChallengeGateProps {
  challengeId:       string
  challengeTitle:    string
  problemStatement:  string
  onPass:            (result: ChallengeGateResult) => void
  onClose:           () => void
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function ChallengeGate({
  challengeId,
  challengeTitle,
  problemStatement,
  onPass,
  onClose,
}: ChallengeGateProps) {
  const [phase, setPhase]         = useState<'loading' | 'test' | 'pass' | 'fail'>('loading')
  const [genStatus, setGenStatus] = useState<GenerationStatus>('idle')
  const [genError, setGenError]   = useState<string | null>(null)
  const [questions, setQuestions] = useState<MCQQuestion[]>([])
  const [answers, setAnswers]     = useState<number[]>([])
  const [qIdx, setQIdx]           = useState(0)
  const [timeLeft, setTimeLeft]   = useState(25 * 60) // 25 min for challenge-specific gate
  const [score, setScore]         = useState(0)
  const [gateResult, setGateResult] = useState<ChallengeGateResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  // Generate/fetch questions on mount
  useEffect(() => {
    generateChallengeMCQ(challengeId, problemStatement, setGenStatus).then(result => {
      if (result.status === 'error') {
        setGenError(result.error ?? 'Generation failed.')
        return
      }
      if (result.error) setGenError(result.error) // warn-level
      setQuestions(result.questions)
      setAnswers(new Array(result.questions.length).fill(-1))
      setPhase('test')
    })
  }, [challengeId, problemStatement])

  // Timer
  const submitGate = useCallback((finalAnswers: number[]) => {
    clearInterval(timerRef.current)
    const qs = questions
    const correct = qs.reduce((acc, q, i) => acc + (finalAnswers[i] === q.correct ? 1 : 0), 0)
    const passed  = correct >= PASS_SCORE

    const topicWrong: Record<string, { wrong: number; qs: MCQQuestion[] }> = {}
    qs.forEach((q, i) => {
      if (finalAnswers[i] !== -1 && finalAnswers[i] !== q.correct) {
        if (!topicWrong[q.topic]) topicWrong[q.topic] = { wrong: 0, qs: [] }
        topicWrong[q.topic].wrong++
        topicWrong[q.topic].qs.push(q)
      }
    })

    const weakAreas = Object.entries(topicWrong)
      .map(([topic, d]) => ({ topic, wrong: d.wrong }))
      .sort((a, b) => b.wrong - a.wrong)

    const missedQs = qs.filter((_, i) => finalAnswers[i] !== -1 && finalAnswers[i] !== qs[i].correct)

    const result: ChallengeGateResult = {
      challengeId,
      score:    correct,
      total:    20,
      passed,
      accuracy: Math.round((correct / 20) * 100),
      weakAreas,
      missedQs,
      passedAt: new Date().toISOString(),
    }

    setScore(correct)
    setGateResult(result)
    setPhase(passed ? 'pass' : 'fail')
    if (passed) recordGatePass(challengeId, correct)
  }, [questions, challengeId])

  useEffect(() => {
    if (phase !== 'test') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { submitGate(answers); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, submitGate, answers])

  const selectAnswer = (i: number) => {
    const next = [...answers]
    next[qIdx] = i
    setAnswers(next)
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isCritical = timeLeft <= 60
  const isWarning  = timeLeft <= 180 && !isCritical
  const answered   = answers.filter(a => a !== -1).length
  const q          = questions[qIdx]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[620px] rounded-2xl overflow-hidden relative"
        style={{
          background:   'rgba(8,8,8,0.98)',
          border:       `1px solid rgba(212,175,55,0.18)`,
          boxShadow:    `0 32px 100px -12px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(212,175,55,0.1)`,
          maxHeight:    '90vh',
          overflowY:    'auto',
        }}
      >
        {/* Header bar — always visible */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5"
          style={{ background: 'rgba(8,8,8,0.97)', borderBottom: `1px solid rgba(212,175,55,0.1)` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
              <Shield size={14} style={{ color: '#000' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">Competency Gate</p>
              <p className="text-[10px] leading-tight truncate max-w-[240px]"
                style={{ color: 'rgba(255,255,255,0.35)' }}>{challengeTitle}</p>
            </div>
          </div>

          {phase === 'test' && (
            <div className="flex items-center gap-3">
              <span className="label-caps" style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
                {answered}/20 done
              </span>
              <div className="font-display text-xl font-bold"
                style={{ color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : GOLD }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>
          )}

          {phase !== 'test' && (
            <button onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Close
            </button>
          )}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {/* Loading */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GeneratingScreen status={genStatus} />
              {genError && (
                <div className="mx-5 mb-5 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs" style={{ color: '#f59e0b' }}>⚠️ {genError}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Test */}
          {phase === 'test' && q && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-5">
              {/* Progress bar */}
              <div className="h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  animate={{ width: `${(qIdx / 19) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})` }}
                />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div key={qIdx}
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label-caps" style={{ fontSize: 9, color: GOLD }}>Q{qIdx + 1} · {q.topic}</span>
                    {(q as MCQQuestion & { difficulty?: string }).difficulty && (
                      <span className="label-caps" style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
                        {(q as MCQQuestion & { difficulty?: string }).difficulty}
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl mb-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.08)' }}>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: '#f0ece2' }}>{q.question}</p>
                  </div>

                  <div className="space-y-2.5 mb-5">
                    {['A', 'B', 'C', 'D'].map((letter, i) => {
                      const selected = answers[qIdx] === i
                      return (
                        <motion.button key={letter} whileHover={{ y: -1 }}
                          onClick={() => selectAnswer(i)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                          style={{
                            borderColor: selected ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.08)',
                            background:  selected ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                            style={{
                              background: selected ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` : 'transparent',
                              border:     selected ? 'none' : `1px solid rgba(212,175,55,0.2)`,
                              color:      selected ? '#000' : 'rgba(255,255,255,0.4)',
                            }}>
                            {letter}
                          </div>
                          <span className="text-sm" style={{ color: selected ? '#f0ece2' : 'rgba(255,255,255,0.65)' }}>
                            {q.options[i]}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button onClick={() => setQIdx(i => Math.max(0, i - 1))} disabled={qIdx === 0}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium disabled:opacity-30 transition-all"
                      style={{ border: `1px solid rgba(212,175,55,0.15)`, color: 'rgba(255,255,255,0.5)' }}>
                      <ArrowLeft size={12} /> Prev
                    </button>

                    {qIdx < 19 ? (
                      <button onClick={() => setQIdx(i => Math.min(19, i + 1))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                        Next <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button onClick={() => submitGate(answers)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                        style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', boxShadow: `0 0 20px -4px rgba(212,175,55,0.5)` }}>
                        <Shield size={12} /> Submit Gate
                      </button>
                    )}
                  </div>

                  {/* Question map */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {answers.map((a, i) => (
                      <button key={i} onClick={() => setQIdx(i)}
                        className="w-6 h-6 rounded-md text-[9px] font-bold transition-all"
                        style={{
                          background: i === qIdx
                            ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`
                            : a !== -1 ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                          color:      i === qIdx ? '#000' : a !== -1 ? GOLD : 'rgba(255,255,255,0.25)',
                          border:     `1px solid ${i === qIdx ? 'transparent' : a !== -1 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* PASS — Celebration */}
          {phase === 'pass' && (
            <motion.div key="pass" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PassCelebration score={score} onContinue={() => gateResult && onPass(gateResult)} />
            </motion.div>
          )}

          {/* FAIL */}
          {phase === 'fail' && gateResult && (
            <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Lock size={28} style={{ color: '#ef4444' }} />
              </div>
              <p className="label-caps mb-2" style={{ color: '#ef4444' }}>Gate Failed</p>
              <div className="font-display text-4xl font-bold mb-1">
                <span style={{ color: '#ef4444' }}>{score}</span>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>/20</span>
              </div>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Required: 14/20 · You got: {score}/20
              </p>
              <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {20 - score} more correct answers needed to unlock this challenge.
              </p>

              {gateResult.weakAreas.length > 0 && (
                <div className="p-4 rounded-xl mb-5 text-left"
                  style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles size={12} style={{ color: GOLD }} />
                    <p className="text-xs font-semibold" style={{ color: GOLD }}>
                      Weak areas — the AI Concierge can build a study plan for these
                    </p>
                  </div>
                  {gateResult.weakAreas.slice(0, 4).map(wa => (
                    <div key={wa.topic} className="flex justify-between items-center py-1.5 border-b text-xs"
                      style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{wa.topic}</span>
                      <span style={{ color: '#ef4444' }}>{wa.wrong} mistake{wa.wrong > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => {
                    // Store weak areas for ProvoAssistant study plan
                    if (gateResult) {
                      sessionStorage.setItem('provo_study_plan_request', JSON.stringify({
                        challengeTitle:  challengeTitle,
                        challengeId,
                        weakAreas:       gateResult.weakAreas,
                        missedCount:     gateResult.missedQs.length,
                        missedTopics:    [...new Set(gateResult.missedQs.map(q => q.topic))],
                        requestedAt:     new Date().toISOString(),
                      }))
                    }
                    onClose()
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}
                >
                  <Sparkles size={13} /> Get Study Plan
                </button>
                <button onClick={() => {
                  setPhase('loading')
                  setQIdx(0)
                  setAnswers(new Array(20).fill(-1))
                  setTimeLeft(25 * 60)
                  setPhase('test')
                }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(255,255,255,0.6)' }}>
                  Retry Gate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
