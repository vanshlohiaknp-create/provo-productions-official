import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Search, Clock, Users, Trophy, FileText, ArrowLeft, Shield, Lock, Unlock, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import CertificatePreview from '@/components/certificate/CertificatePreview'
import ChallengeGate from '@/components/mcq/ChallengeGate'
import { Button, Badge, EmptyState, Textarea, Input } from '@/components/ui'
import { SAMPLE_CHALLENGES } from '@/data/sampleData'
import { useAuth } from '@/contexts/AuthContext'
import { hasPassedGate, getGatePassRecord } from '@/lib/mcqGenerator'
import { usePayment } from '@/hooks/usePayment'
import PaymentVerificationModal from '@/components/ui/PaymentVerificationModal'
import type { ChallengeGateResult, PricingPlan } from '@/types'

const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5D77A'
const TAGS = ['All', 'Marketing', 'Strategy', 'Design', 'Analytics', 'Research']

// ===== CHALLENGES LIST =====
export function Challenges() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState('All')

  const filtered = SAMPLE_CHALLENGES.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchTag = tag === 'All' || c.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    return matchSearch && matchTag
  })

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16">
        <div className="mb-10">
          <p className="label-caps mb-2">Platform</p>
          <h1 className="font-display mb-2" style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>Challenges</h1>
          <p className="text-sm mb-1" style={{ maxWidth: 480 }}>
            Real-world problems posted by businesses and faculty. Solve to earn verified certificates.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={11} style={{ color: GOLD }} />
            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.7)' }}>
              Each challenge is gated by a 20-question AI-generated competency test. Score 14/20 to unlock submission.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-7">
          <div className="relative flex-1 min-w-[200px] max-w-[380px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(212,175,55,0.1)`, color: '#f0ece2' }}
              placeholder="Search challenges…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)')}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map(t => (
              <button key={t} onClick={() => setTag(t)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  background: tag === t ? 'rgba(212,175,55,0.08)' : 'transparent',
                  borderColor: tag === t ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.1)',
                  color: tag === t ? GOLD : 'rgba(255,255,255,0.4)',
                }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Early access banner */}
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(212,175,55,0.04)', border: `1px solid rgba(212,175,55,0.15)` }}>
          <span className="text-lg flex-shrink-0">🚀</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: GOLD }}>Early Access — Sample Challenges</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Demo challenges to preview Provo. Real challenges appear when businesses post them.
              Each challenge generates a unique AI competency test on first access.
            </p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        ) : (
          <EmptyState icon="🔍" title="No challenges match" description="Try a different search or filter." />
        )}

        <div className="mt-10">
          <EmptyState icon="📮" title="More challenges coming"
            description="Real challenges appear once businesses and faculty post them."
            action={<Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>Sign Up Free</Button>}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ===== CHALLENGE DETAIL =====
export function ChallengeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const challenge = SAMPLE_CHALLENGES.find(c => c.id === id)
  const [showGate, setShowGate] = useState(false)
  const [gatePassed, setGatePassed] = useState(false)
  const [passRecord, setPassRecord] = useState<ReturnType<typeof getGatePassRecord>>(null)

  // Check gate status on mount and on focus
  const checkGate = () => {
    if (id) {
      const passed = hasPassedGate(id)
      setGatePassed(passed)
      setPassRecord(getGatePassRecord(id))
    }
  }

  useEffect(() => { checkGate() }, [id])

  if (!challenge) {
    return (
      <div className="min-h-screen" style={{ background: '#000000' }}>
        <Navbar />
        <div className="page-container pt-24">
          <EmptyState icon="🔍" title="Challenge not found"
            action={<Button variant="outline" size="sm" onClick={() => navigate('/challenges')}>Back to Challenges</Button>} />
        </div>
      </div>
    )
  }

  const handleSolveClick = () => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'student') return
    if (gatePassed) { navigate(`/challenges/${challenge.id}/submit`); return }
    setShowGate(true)
  }

  const handleGatePass = (result: ChallengeGateResult) => {
    setShowGate(false)
    setGatePassed(true)
    setPassRecord(getGatePassRecord(challenge.id))
    navigate(`/challenges/${challenge.id}/submit`)
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 820 }}>
        <button onClick={() => navigate('/challenges')}
          className="flex items-center gap-1.5 text-xs mb-7 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={14} /> Back to Challenges
        </button>

        <div className="card-base p-8 rounded-2xl" style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="label-caps mb-1">{challenge.company_name}</p>
              <h1 className="font-display mb-2" style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 700 }}>
                {challenge.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant={({ Easy: 'accent', Medium: 'warning', Hard: 'danger' } as const)[challenge.difficulty] || 'muted'}>
                  {challenge.difficulty}
                </Badge>
                {challenge.tags.map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <p className="font-display text-2xl font-bold" style={{ color: GOLD }}>{challenge.reward}</p>
              <p className="label-caps">{challenge.applicant_count} applicants</p>
            </div>
          </div>

          {/* Gate status card */}
          <div className="mb-6 p-4 rounded-xl border flex items-start gap-3"
            style={{
              borderColor: gatePassed ? 'rgba(34,197,94,0.3)' : 'rgba(212,175,55,0.2)',
              background: gatePassed ? 'rgba(34,197,94,0.05)' : 'rgba(212,175,55,0.04)',
            }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: gatePassed ? 'rgba(34,197,94,0.1)' : 'rgba(212,175,55,0.1)' }}>
              {gatePassed
                ? <Unlock size={15} style={{ color: '#22c55e' }} />
                : <Lock size={15} style={{ color: GOLD }} />
              }
            </div>
            <div className="flex-1">
              {gatePassed ? (
                <>
                  <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>Gate Passed ✓</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Score: {passRecord?.score}/20 · Submission form unlocked.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold" style={{ color: GOLD }}>Competency Gate Active</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Pass 14/20 AI-generated questions to unlock submission. Questions are specific to this challenge.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-7">
            <h2 className="text-sm font-semibold mb-3">Description</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{challenge.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-7">
            <h2 className="text-sm font-semibold mb-3">Submission Requirements</h2>
            <div className="space-y-2">
              {[
                'Project documentation (PDF or PPT, max 10 MB)',
                'Source code or demo link (optional)',
              ].map(req => (
                <div key={req} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <FileText size={13} style={{ color: GOLD }} /> {req}
                </div>
              ))}
            </div>
          </div>

          {/* How to solve */}
          <div className="mb-8 p-5 rounded-xl border" style={{ borderColor: 'rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.02)' }}>
            <h2 className="text-sm font-semibold mb-4">📘 How to Solve This</h2>
            <ol className="space-y-3">
              {[
                'Pass the 20-question Competency Gate to verify domain knowledge.',
                'Read the brief twice — note every requirement and constraint.',
                'Research & structure — gather relevant data, case studies, benchmarks.',
                'Build your solution — clear PDF or PPT with strategy and expected outcomes.',
                'Upload and submit before the deadline.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
                    style={{
                      background: i === 0 ? `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` : 'rgba(212,175,55,0.08)',
                      border: i === 0 ? 'none' : `1px solid rgba(212,175,55,0.2)`,
                      color: i === 0 ? '#000' : GOLD,
                    }}>
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Certificate preview callout */}
          <div className="mb-7 p-4 rounded-xl border flex items-start gap-3"
            style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
            <span className="text-xl flex-shrink-0">🏅</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: GOLD }}>Proof-of-Work Certificate</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user ? `"${user.full_name} solved '${challenge.title}' — verified by ${challenge.company_name} via Provo."` : 'Accepted submissions earn a LinkedIn-shareable verified certificate.'}
              </p>
            </div>
          </div>

          {/* CTA */}
          {user?.role === 'student' ? (
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: `0 0 40px -6px rgba(212,175,55,0.4)` }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSolveClick}
              className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: gatePassed ? 'rgba(34,197,94,0.15)' : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                border: gatePassed ? '1px solid rgba(34,197,94,0.3)' : 'none',
                color: gatePassed ? '#22c55e' : '#000',
                fontWeight: 700,
              }}
            >
              {gatePassed
                ? <><CheckCircle size={16} /> Submit Your Solution</>
                : <><Shield size={16} /> Enter Competency Gate</>
              }
            </motion.button>
          ) : !user ? (
            <Button variant="primary" fullWidth style={{ height: 48 }} onClick={() => navigate('/signup')}>
              Sign Up to Apply
            </Button>
          ) : null}
        </div>
      </div>

      {/* Challenge Gate Modal */}
      <AnimatePresence>
        {showGate && (
          <ChallengeGate
            challengeId={challenge.id}
            challengeTitle={challenge.title}
            problemStatement={challenge.description}
            onPass={handleGatePass}
            onClose={() => setShowGate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== SUBMIT SOLUTION — gated =====
export function SubmitSolution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [content, setContent] = useState('')
  const [link, setLink] = useState('')
  const challenge = SAMPLE_CHALLENGES.find(c => c.id === id)
  const passed = id ? hasPassedGate(id) : false
  const passRecord = id ? getGatePassRecord(id) : null

  // Guard: if gate not passed, redirect back to detail
  useEffect(() => {
    if (id && !hasPassedGate(id)) {
      navigate(`/challenges/${id}`, { replace: true })
    }
  }, [id, navigate])

  // Strict validation: empty submission = critical error
  const handleSubmit = () => {
    if (!content.trim()) {
      alert('⚠️ CRITICAL: Solution description cannot be empty. Please describe your approach before submitting.')
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center p-8 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl mb-5">🎉</motion.div>
          <h2 className="font-display text-2xl font-bold mb-3">Submission Received!</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Your solution has been submitted. You'll be notified when it's reviewed by {challenge?.company_name}.
          </p>
          <div className="p-4 rounded-xl border mb-6" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.05)' }}>
            <p className="text-sm font-semibold" style={{ color: GOLD }}>🏅 Certificate Pending Review</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Gate score: {passRecord?.score}/20 · Accepted submissions earn a verified certificate.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard/student')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            View Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 680 }}>
        <button onClick={() => navigate(`/challenges/${id}`)}
          className="flex items-center gap-1.5 text-xs mb-7 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={14} /> Back to Challenge
        </button>

        {/* Gate pass confirmation */}
        {passRecord && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
            <p className="text-xs font-medium" style={{ color: '#22c55e' }}>
              Gate passed · Score: {passRecord.score}/20 · Submission unlocked
            </p>
          </motion.div>
        )}

        <p className="label-caps mb-2">Submit Solution</p>
        <h1 className="font-display mb-1.5" style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 700 }}>
          {challenge?.title || 'Challenge'}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{challenge?.company_name}</p>

        <div className="card-base p-7 rounded-2xl" style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
          <div className="mb-5">
            <Textarea
              label="Solution Description *"
              placeholder="Describe your approach, methodology, and key insights…"
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <Input
              label="Project / Demo Link (optional)"
              type="url"
              placeholder="https://your-project.com"
              value={link}
              onChange={e => setLink(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1.5">Upload File * (PDF or PPT, max 10 MB)</label>
            <div
              className="border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
              style={{ borderColor: 'rgba(212,175,55,0.2)' }}
              onClick={() => alert('File picker available in live build with Supabase storage.')}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
            >
              <div className="text-4xl mb-3">📁</div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Click to upload or drag & drop</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>PDF, PPT · Max 10 MB</p>
            </div>
          </div>

          <div className="mb-5 p-4 rounded-xl border flex items-center gap-3"
            style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.06)' }}>
            <span className="text-2xl flex-shrink-0">🏅</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: GOLD }}>Earn a Verified Certificate</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Accepted submissions receive a LinkedIn-shareable proof-of-work certificate from {challenge?.company_name}.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: `0 0 32px -6px rgba(212,175,55,0.4)` }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl font-bold text-sm transition-all"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: '#000', fontWeight: 700,
            }}
          >
            Submit Solution
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ===== CREATE CHALLENGE =====
export function CreateChallenge() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkout, status, qrModalProps } = usePayment()
  const [submitted, setSubmitted] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    title: '', company: user?.company || user?.college || '',
    desc: '', reward: '', deadline: '', difficulty: 'Medium', tags: '',
  })

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    // Strict validation
    if (!form.title.trim()) { alert('⚠️ Challenge title is required.'); return }
    if (!form.desc.trim() || form.desc.trim().length < 30) {
      alert('⚠️ Problem description must be at least 30 characters — the AI needs enough context to generate good questions.')
      return
    }

    setGenerating(true)

    const dummyPlan: PricingPlan = {
      id: 'plan_challenge_post',
      name: 'Challenge Posting Fee',
      price: '₹5,000',
      period: 'one-time',
      description: 'Verify your challenge before it goes live',
      paymentAmount: 500000,
      features: [],
      popular: false
    }

    const paymentResult = await checkout(dummyPlan)
    if (paymentResult.status !== 'success') {
      if (paymentResult.status === 'failure') alert(`Payment failed or cancelled: ${paymentResult.message}`)
      setGenerating(false)
      return
    }

    // In live build: POST to Supabase, trigger generateChallengeMCQ on the Edge Function
    // The challenge_id returned by the DB insert is passed to generate_mcq
    await new Promise(r => setTimeout(r, 1200)) // simulate async
    setGenerating(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#000000' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center p-8 max-w-md"
        >
          <div className="text-5xl mb-5">✅</div>
          <h2 className="font-display text-2xl font-bold mb-3">Challenge Submitted!</h2>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Your challenge is under review. An admin will approve it within 24 hours.
          </p>
          <div className="p-4 rounded-xl border mb-6" style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
            <p className="text-xs" style={{ color: GOLD }}>⚡ On approval, the AI will automatically generate 20 domain-specific MCQ questions to gate student access.</p>
          </div>
          <button
            onClick={() => navigate(user?.role === 'business' ? '/dashboard/business' : '/dashboard/faculty')}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            View Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 680 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs mb-7 transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <p className="label-caps mb-2">Post a Challenge</p>
        <h1 className="font-display mb-1.5" style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700 }}>Create Challenge</h1>
        <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Post a real-world problem for students to solve.</p>

        {/* AI gate notice */}
        <div className="mb-6 p-3.5 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(212,175,55,0.04)', border: `1px solid rgba(212,175,55,0.15)` }}>
          <Shield size={14} style={{ color: GOLD, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ color: GOLD, fontWeight: 600 }}>Auto-gating active.</span>{' '}
            On approval, the AI reads your problem description and generates 20 domain-specific MCQ questions.
            Students must score 14/20 before they can submit.
          </p>
        </div>

        <div className="card-base p-7 rounded-2xl" style={{ border: `1px solid rgba(212,175,55,0.1)` }}>
          <div className="mb-4"><Input label="Challenge Title *" placeholder="e.g. Build a GTM strategy for Tier-3 India" value={form.title} onChange={update('title')} /></div>
          <div className="mb-4"><Input label="Company / Institution Name" placeholder="Your company or institution" value={form.company} onChange={update('company')} /></div>
          <div className="mb-1"><Textarea label="Problem Description *" placeholder="Describe the challenge — be specific about goals, constraints, and expected deliverables. The AI reads this to generate 20 relevant questions (min 30 characters)." rows={6} value={form.desc} onChange={update('desc')} /></div>
          <p className="text-xs mb-4" style={{ color: form.desc.length >= 30 ? 'rgba(34,197,94,0.7)' : 'rgba(255,255,255,0.25)' }}>
            {form.desc.length >= 30 ? '✓ Sufficient detail for AI question generation' : `${30 - form.desc.length} more characters needed for AI generation`}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Reward / Prize" placeholder="e.g. ₹15,000 or Certificate" value={form.reward} onChange={update('reward')} />
            <Input label="Deadline" type="date" value={form.deadline} onChange={update('deadline')} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Difficulty</label>
              <select className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(212,175,55,0.1)`, color: '#f0ece2' }}
                value={form.difficulty} onChange={update('difficulty')}>
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d} style={{ background: '#000' }}>{d}</option>)}
              </select>
            </div>
            <Input label="Tags (comma separated)" placeholder="Marketing, Strategy" value={form.tags} onChange={update('tags')} />
          </div>
          <div className="mb-5 p-4 rounded-xl border flex items-center gap-3"
            style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
            <span className="text-xl flex-shrink-0">🏅</span>
            <p className="text-sm" style={{ color: GOLD }}>Winners automatically receive a Verified Proof-of-Work Certificate from Provo.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSubmit}
            disabled={generating}
            className="w-full h-12 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            {generating
              ? <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Submitting…</>
              : 'Submit for Review'
            }
          </motion.button>
        </div>
      </div>

      <PaymentVerificationModal {...qrModalProps} />
    </div>
  )
}
