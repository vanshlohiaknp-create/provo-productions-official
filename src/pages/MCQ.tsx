import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Shield, Zap, Trophy, AlertTriangle, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import { Button, Badge, StatCard } from '@/components/ui'
import { MCQ_QUESTIONS, MCQ_CATEGORIES, type MCQCategory } from '@/data/mcq'
import { useAuth } from '@/contexts/AuthContext'
import type { MCQResult } from '@/types'

const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5D77A'

const TIMER_OPTIONS = [
  { mins: 20, label: '20 min', icon: '⚡', desc: 'High-tension · Competitive' },
  { mins: 30, label: '30 min', icon: '🎯', desc: 'Balanced · Recommended', recommended: true },
  { mins: 60, label: '60 min', icon: '🧠', desc: 'Thorough · Strategic' },
]

// Percentile tiers
function getTier(accuracy: number): { label: string; color: string; icon: string; desc: string } {
  if (accuracy >= 90) return { label: 'ELITE', color: GOLD, icon: '👑', desc: 'Top 10% · Certificate Unlocked' }
  if (accuracy >= 75) return { label: 'QUALIFIED', color: '#22c55e', icon: '🏆', desc: 'Top 30% · Certificate Unlocked' }
  if (accuracy >= 60) return { label: 'BORDERLINE', color: '#f59e0b', icon: '⚠️', desc: 'Top 50% · Review Required' }
  return { label: 'DISQUALIFIED', color: '#ef4444', icon: '🚫', desc: 'Below threshold · Try again' }
}

// ===== MCQ SELECT — Gatekeeper Entry =====
export function MCQSelect() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [category, setCategory] = useState<MCQCategory>('business')
  const [timerMins, setTimerMins] = useState(30)
  const [gatePassed, setGatePassed] = useState(false)

  const start = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    sessionStorage.setItem('mcq_config', JSON.stringify({ category, timerMins }))
    navigate('/mcq/test')
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 700 }}>

        {/* Gatekeeper Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <Shield size={11} style={{ color: GOLD }} />
            <span className="label-caps" style={{ color: GOLD }}>Competency Gate · Elite Filter Active</span>
          </div>
          <h1 className="font-display mb-3" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700 }}>
            Prove Your{' '}
            <span style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontStyle: 'italic',
            }}>Competency.</span>
          </h1>
          <p className="text-sm mb-2" style={{ maxWidth: 480, color: 'rgba(255,255,255,0.55)' }}>
            20 questions. Timed. No second chances until the clock runs out.
            Only the top percentile earns a certificate.
          </p>
          <p className="text-xs italic" style={{ color: 'rgba(212,175,55,0.55)' }}>
            Top 10% → Elite · Top 30% → Qualified · Below 60% → Disqualified
          </p>
        </motion.div>

        {/* Gatekeeper auth lock */}
        {!isAuthenticated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-7 p-5 rounded-xl flex items-center gap-4"
            style={{ border: `1px solid rgba(239,68,68,0.25)`, background: 'rgba(239,68,68,0.05)' }}>
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Authentication Required</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>You must be signed in to access the Competency Gate.</p>
            </div>
            <button onClick={() => navigate('/login')} className="px-4 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
              Sign In
            </button>
          </motion.div>
        )}

        {/* Timer selection */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <h3 className="text-sm font-semibold mb-3">Time Limit</h3>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {TIMER_OPTIONS.map(opt => (
              <div key={opt.mins} onClick={() => setTimerMins(opt.mins)}
                className="card-hover p-5 text-center cursor-pointer rounded-xl relative"
                style={{
                  borderColor: timerMins === opt.mins ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.08)',
                  background: timerMins === opt.mins ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                }}>
                {opt.recommended && (
                  <span className="absolute -top-2.5 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000' }}>
                    Recommended
                  </span>
                )}
                <div className="text-3xl mb-2">{opt.icon}</div>
                <div className="font-display text-xl font-bold mb-1"
                  style={{ color: timerMins === opt.mins ? GOLD : '#f0ece2' }}>
                  {opt.label}
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{opt.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category selection */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <h3 className="text-sm font-semibold mb-3">Domain</h3>
          <div className="grid grid-cols-1 gap-2.5 mb-8">
            {(Object.keys(MCQ_CATEGORIES) as MCQCategory[]).map(cat => {
              const cfg = MCQ_CATEGORIES[cat]
              return (
                <div key={cat} onClick={() => setCategory(cat)}
                  className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                  style={{
                    borderColor: category === cat ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.08)',
                    background: category === cat ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: category === cat ? GOLD : '#f0ece2' }}>
                      {cfg.label}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{cfg.description}</p>
                  </div>
                  {category === cat && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` }}>
                      <span className="text-[10px] text-black font-bold">✓</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Elite filter info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="p-5 rounded-xl mb-8"
          style={{ border: `1px solid rgba(212,175,55,0.15)`, background: 'rgba(212,175,55,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} style={{ color: GOLD }} />
            <h4 className="text-sm font-semibold" style={{ color: GOLD }}>Elite Filter Active</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['👑 Elite', '90–100%', GOLD],
              ['🏆 Qualified', '70–89%', '#22c55e'],
              ['⚠️ Borderline', '60–69%', '#f59e0b'],
              ['🚫 Disqualified', '<60%', '#ef4444'],
            ].map(([tier, range, color]) => (
              <div key={tier as string} className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-xs font-semibold" style={{ color: color as string }}>{tier as string}</span>
                <span className="label-caps" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{range as string}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <button
            onClick={start}
            disabled={!isAuthenticated}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: '#000', fontWeight: 700,
              boxShadow: `0 0 40px -8px rgba(212,175,55,0.5)`,
              letterSpacing: '0.03em',
            }}
          >
            {isAuthenticated ? 'Enter the Competency Gate →' : 'Sign In to Begin'}
          </button>
          {isAuthenticated && (
            <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Good luck, {user?.full_name?.split(' ')[0]}. May the best mind win.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ===== MCQ TEST — High-Tension Arena =====
export function MCQTest() {
  const navigate = useNavigate()
  const config = JSON.parse(sessionStorage.getItem('mcq_config') || '{"category":"business","timerMins":30}')
  const questions = MCQ_QUESTIONS[config.category as MCQCategory] || MCQ_QUESTIONS.business

  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>(new Array(20).fill(-1))
  const [timeLeft, setTimeLeft] = useState(config.timerMins * 60)
  const [submitted, setSubmitted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const submit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    clearInterval(intervalRef.current)
    const correct = questions.reduce((acc: number, q: any, i: number) => acc + (answers[i] === q.correct ? 1 : 0), 0)
    const wrong = answers.filter((a: number, i: number) => a !== -1 && a !== questions[i].correct).length
    const skipped = answers.filter((a: number) => a === -1).length
    const topicWrong: Record<string, number> = {}
    questions.forEach((q: any, i: number) => {
      if (answers[i] !== -1 && answers[i] !== q.correct) topicWrong[q.topic] = (topicWrong[q.topic] || 0) + 1
    })
    const weakAreas = Object.entries(topicWrong).map(([topic, w]) => ({ topic, wrong: w as number })).sort((a, b) => b.wrong - a.wrong)
    const result: MCQResult = {
      score: correct, total: 20,
      accuracy: Math.round((correct / 20) * 100),
      correct, wrong, skipped,
      timeTaken: config.timerMins * 60 - timeLeft,
      weakAreas, answers, category: config.category,
    }
    sessionStorage.setItem('mcq_result', JSON.stringify(result))
    navigate('/mcq/results')
  }, [submitted, answers, questions, timeLeft, config, navigate])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { submit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [submit])

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const isCritical = timeLeft <= 60
  const isWarning = timeLeft <= 180 && !isCritical
  const progress = (qIdx / 19) * 100
  const q = questions[qIdx]
  const answered = answers.filter((a: number) => a !== -1).length

  const selectAnswer = (i: number) => {
    const newA = [...answers]
    newA[qIdx] = i
    setAnswers(newA)
    setSelectedOption(i)
  }

  const goNext = () => {
    if (qIdx < 19) { setQIdx(qIdx + 1); setSelectedOption(answers[qIdx + 1] !== -1 ? answers[qIdx + 1] : null) }
  }
  const goPrev = () => {
    if (qIdx > 0) { setQIdx(qIdx - 1); setSelectedOption(answers[qIdx - 1] !== -1 ? answers[qIdx - 1] : null) }
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 700 }}>

        {/* Header bar */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="label-caps mb-1">{MCQ_CATEGORIES[config.category as MCQCategory]?.label} · Competency Gate</p>
            <h2 className="font-display text-xl font-bold">Question {qIdx + 1} <span style={{ color: 'rgba(255,255,255,0.3)' }}>of 20</span></h2>
          </div>
          {/* Timer */}
          <div className="text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}
                initial={{ scale: 0.95 }}
                animate={isCritical ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.6 } } : { scale: 1 }}
                className="font-display text-3xl font-bold"
                style={{ color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : GOLD }}
              >
                {timerStr}
              </motion.div>
            </AnimatePresence>
            <p className="label-caps mt-1 flex items-center gap-1 justify-end" style={{ fontSize: 9 }}>
              <Clock size={9} />
              {isCritical ? 'FINAL SECONDS' : isWarning ? 'LOW TIME' : 'REMAINING'}
            </p>
          </div>
        </div>

        {/* Progress track */}
        <div className="relative h-1.5 rounded-full mb-7 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`, boxShadow: `0 0 8px rgba(212,175,55,0.4)` }}
          />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="card-base p-6 rounded-xl mb-5"
              style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
              <p className="text-[15px] font-medium leading-relaxed" style={{ color: '#f0ece2' }}>{q.question}</p>
            </div>

            <div className="space-y-3 mb-7">
              {['A', 'B', 'C', 'D'].map((letter, i) => {
                const isSelected = answers[qIdx] === i
                return (
                  <motion.div
                    key={letter}
                    whileHover={{ y: -1 }}
                    onClick={() => selectAnswer(i)}
                    className="flex items-center gap-4 px-5 py-3.5 rounded-xl border cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.08)',
                      background: isSelected ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all"
                      style={{
                        background: isSelected ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` : 'transparent',
                        border: isSelected ? 'none' : `1px solid rgba(212,175,55,0.2)`,
                        color: isSelected ? '#000' : 'rgba(255,255,255,0.5)',
                        fontWeight: 700,
                      }}
                    >
                      {letter}
                    </div>
                    <span className="text-sm" style={{ color: isSelected ? '#f0ece2' : 'rgba(255,255,255,0.7)' }}>
                      {q.options[i]}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev} disabled={qIdx === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{ border: `1px solid rgba(212,175,55,0.15)`, color: 'rgba(255,255,255,0.6)' }}
          >
            <ArrowLeft size={14} /> Previous
          </button>

          <p className="label-caps" style={{ fontSize: 9 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>{answered}</span>/20 answered
          </p>

          {qIdx < 19 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                color: '#000', fontWeight: 700,
                boxShadow: `0 0 28px -6px rgba(212,175,55,0.5)`,
              }}
            >
              Submit Test <Shield size={14} />
            </button>
          )}
        </div>

        {/* Question map */}
        <div className="mt-7 p-4 rounded-xl" style={{ border: `1px solid rgba(212,175,55,0.08)`, background: 'rgba(212,175,55,0.02)' }}>
          <p className="label-caps mb-3" style={{ fontSize: 9 }}>Question Map</p>
          <div className="flex flex-wrap gap-1.5">
            {answers.map((a, i) => (
              <button
                key={i}
                onClick={() => { setQIdx(i); setSelectedOption(answers[i] !== -1 ? answers[i] : null) }}
                className="w-7 h-7 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  background: i === qIdx
                    ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`
                    : a !== -1 ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  color: i === qIdx ? '#000' : a !== -1 ? GOLD : 'rgba(255,255,255,0.3)',
                  border: `1px solid ${i === qIdx ? 'transparent' : a !== -1 ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== MCQ RESULTS — Elite Verdict =====
export function MCQResults() {
  const navigate = useNavigate()
  const result: MCQResult = JSON.parse(sessionStorage.getItem('mcq_result') || '{}')

  if (!result.total) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>No results found.</p>
          <button onClick={() => navigate('/mcq')} className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            Take MCQ Test
          </button>
        </div>
      </div>
    )
  }

  const pct = result.accuracy
  const tier = getTier(pct)
  const passed = pct >= 70

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 680, textAlign: 'center' }}>

        {/* Tier verdict */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
            style={{ background: `${tier.color}12`, border: `1px solid ${tier.color}40` }}>
            <span>{tier.icon}</span>
            <span className="font-semibold text-sm" style={{ color: tier.color }}>{tier.label}</span>
          </div>
          <p className="label-caps mb-2">Competency Gate Result</p>
          <h1 className="font-display mb-2" style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>
            Your Verdict
          </h1>
          <p className="text-sm" style={{ color: tier.color }}>{tier.desc}</p>
        </motion.div>

        {/* Score ring */}
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-36 h-36 mx-auto mb-8"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle, ${tier.color}18 0%, transparent 70%)`,
          }} />
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="50" fill="none" strokeWidth="8"
              stroke={tier.color}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
              animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - pct / 100)}` }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="font-display text-3xl font-bold leading-none"
              style={{ color: tier.color }}
            >
              {pct}%
            </motion.span>
            <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{result.score}/{result.total}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-4 gap-3 mb-7 text-left">
          <StatCard icon="✅" value={result.correct} label="Correct" color="text-[var(--accent)]" />
          <StatCard icon="❌" value={result.wrong} label="Wrong" color="text-red-500" />
          <StatCard icon="⏭️" value={result.skipped} label="Skipped" color="text-[var(--text-2)]" />
          <StatCard icon="⏱️" value={`${Math.floor(result.timeTaken / 60)}m`} label="Time Used" color="text-[var(--warning)]" />
        </motion.div>

        {/* Weak areas */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="card-base p-5 rounded-xl mb-5 text-left"
          style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={14} style={{ color: GOLD }} /> Domain Analysis
          </h3>
          {result.weakAreas?.length ? (
            <div className="space-y-2">
              {result.weakAreas.map(wa => (
                <div key={wa.topic} className="flex items-center justify-between py-2 border-b"
                  style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{wa.topic}</span>
                  <Badge variant="warning">{wa.wrong} mistake{wa.wrong > 1 ? 's' : ''}</Badge>
                </div>
              ))}
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Reinforce these areas to break into the Elite tier.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>👑</span>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>No weaknesses detected. Elite performance.</p>
            </div>
          )}
        </motion.div>

        {/* Certificate / failure card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {passed ? (
            <div className="p-5 rounded-xl border mb-5 flex items-center gap-4 text-left"
              style={{ borderColor: `${tier.color}30`, background: `${tier.color}08` }}>
              <span className="text-3xl flex-shrink-0">{tier.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: tier.color }}>
                  {pct >= 90 ? 'Elite Certificate Earned' : 'Certificate Earned'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {pct >= 90
                    ? 'Your performance places you in the top 10%. This certificate carries elite weight.'
                    : 'Your Provo MCQ Achievement Certificate is ready. Share it on LinkedIn.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border mb-5"
              style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
              <p className="text-sm font-semibold text-red-400 mb-1">🚫 Disqualified</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                You scored {pct}%. The threshold is 70%. The Competency Gate requires no mercy — study and return.
              </p>
            </div>
          )}
        </motion.div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('/mcq')} className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            {passed ? 'Try for Elite →' : 'Try Again →'}
          </button>
          <button onClick={() => navigate('/challenges')}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ border: `1px solid rgba(212,175,55,0.2)`, color: 'rgba(255,255,255,0.7)' }}>
            Browse Challenges
          </button>
        </div>
      </div>
    </div>
  )
}
