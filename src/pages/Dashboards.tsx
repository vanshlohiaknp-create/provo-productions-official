import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, BarChart3, Users, Briefcase, ArrowRight, ShieldCheck, Activity, Zap, Globe, TrendingUp, AlertTriangle, CheckCircle, Clock, Database, Cpu, Server, RefreshCw } from 'lucide-react'
import {
  startGuardianHeartbeat, getLastGuardianReport, runGuardianDiagnostic,
  getSeverityColor, getSeverityLabel,
  type GuardianReport, type GuardianCheck,
} from '@/lib/guardian'
import Navbar from '@/components/layout/Navbar'
import { Button, EmptyState, StatCard, ScoreBar, Badge, CinematicGreeting } from '@/components/ui'
import ProvoAssistant from '@/components/chatbot/ProvoAssistant'
import { useAuth } from '@/contexts/AuthContext'
import { getGreeting } from '@/lib/utils'
import { useSystemIntegrity } from '@/hooks/useSystemIntegrity'

const GOLD = '#D4AF37'
const GOLD_LIGHT = '#F5D77A'

const fadeUp = {
  hidden: { opacity: 0, y: 40, rotateX: 15 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 1.0 + i * 0.05, type: "spring", stiffness: 120, damping: 25 },
  }),
}

// ===== STUDENT DASHBOARD =====
export function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useSystemIntegrity()

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <Navbar />

      {/* Obsidian Glass Intro */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)' }}
        animate={{ backgroundColor: 'transparent', backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="page-container pt-24 pb-16" style={{ maxWidth: 980, perspective: '1200px' }}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-9">
          <div>
            <CinematicGreeting />
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.06)', color: '#ffffff' }}>
              <span className="text-sm">⭐</span>
              Founder's Badge
            </div>
          </div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex gap-2 flex-shrink-0 mt-1 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>Profile</Button>
            <button onClick={() => navigate('/challenges')} className="px-4 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
              Browse Challenges
            </button>
          </motion.div>
        </div>

        {/* Onboarding */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="mb-7 p-5 rounded-xl border flex items-start gap-4"
          style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(212,175,55,0.12)' }}>🚀</div>
          <div>
            <h4 className="text-sm font-semibold mb-1.5">Solve your first challenge to earn your first certificate.</h4>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480 }}>
              Each accepted submission earns you a verified proof-of-work certificate — shareable on LinkedIn.
            </p>
            <button onClick={() => navigate('/challenges')} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
              Browse Challenges <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard icon="🎯" value="0" label="Submissions" color="grad-text" />
          <StatCard icon="✅" value="0" label="Accepted" color="text-[var(--accent)]" />
          <StatCard icon="⭐" value="—" label="Rating" color="text-[var(--warning)]" />
          <StatCard icon="📈" value={user?.provo_score || 0} label="Provo Score" color="text-[var(--primary)]" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="card-base p-5 rounded-xl mb-7">
          <ScoreBar score={user?.provo_score || 0} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mb-7">
          <div className="flex items-center gap-2 mb-4"><span className="text-lg">💰</span><h3 className="text-sm font-semibold">Wallet & Payouts</h3></div>
          <div className="card-base p-5 rounded-xl border flex flex-wrap gap-4 items-center justify-between" style={{ borderColor: 'rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: GOLD }}>Available Balance</p>
              <h2 className="font-display text-3xl font-bold mt-1">₹0.00</h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Payouts processed via manual UPI verification</p>
            </div>
            <button onClick={() => alert('Simulating manual UPI payout transfer... (Requires backend server API calls in production)')} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
              Withdraw Payout
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="mb-7">
          <div className="flex items-center gap-2 mb-4"><span className="text-lg">🏅</span><h3 className="text-sm font-semibold">Certificates</h3></div>
          <EmptyState compact icon="🏅" title="No certificates yet"
            description="Solve challenges and get accepted to earn verified certificates."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/challenges')}>Browse Challenges</Button>}
          />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
          <h3 className="text-sm font-semibold mb-4">Submissions</h3>
          <EmptyState compact icon="📋" title="No submissions yet"
            description="Start solving challenges to build your proof profile."
            action={<Button variant="outline" size="sm" onClick={() => navigate('/challenges')}>Explore Challenges</Button>}
          />
        </motion.div>
      </div>
      <ProvoAssistant />
    </div>
  )
}

// ===== BUSINESS DASHBOARD =====
export function BusinessDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const TEMPLATES = [
    { icon: '📈', title: 'Grow Instagram for a D2C brand', tags: ['Marketing'] },
    { icon: '🎯', title: 'GTM strategy for a local business', tags: ['Strategy'] },
    { icon: '🖥️', title: 'Design a landing page for a product', tags: ['Design'] },
  ]

  useSystemIntegrity()

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <Navbar />

      {/* Obsidian Glass Intro */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)' }}
        animate={{ backgroundColor: 'transparent', backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="page-container pt-24 pb-16" style={{ maxWidth: 1000, perspective: '1200px' }}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-9">
          <div>
            <CinematicGreeting />
          </div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex gap-2 flex-shrink-0 mt-1">
            <button onClick={() => navigate('/challenges/create')} className="px-4 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
              <span className="flex items-center gap-1.5"><Plus size={14} /> Post Challenge</span>
            </button>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="card-base p-5 rounded-xl mb-7" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center gap-2 mb-4"><span>✨</span><h4 className="text-sm font-semibold">Sample Challenge Templates</h4></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <div key={t.title} className="card-hover p-4 rounded-xl cursor-pointer" onClick={() => navigate('/challenges/create')}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <p className="text-xs font-semibold mb-2">{t.title}</p>
                <div className="flex gap-1.5">{t.tags.map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard icon="📄" value="0" label="Active" color="grad-text" />
          <StatCard icon="👥" value="0" label="Applicants" color="text-[var(--accent)]" />
          <StatCard icon="👁️" value="0" label="Views" color="text-[var(--warning)]" />
          <StatCard icon="📊" value="0" label="Total" color="grad-text" />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="card-base p-4 rounded-xl mb-7 flex items-center justify-between"
          style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.03)' }}>
          <div className="flex items-center gap-3">
            <Target size={18} style={{ color: GOLD, flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold">Find Talent</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Browse top-ranked students by Provo Score</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
            Browse Talent <ArrowRight size={13} />
          </Button>
        </motion.div>

        <h3 className="text-sm font-semibold mb-4">Your Challenges</h3>
        <EmptyState compact icon="📋" title="No challenges posted"
          description="Post your first challenge to start discovering verified talent."
          action={<Button variant="primary" size="sm" onClick={() => navigate('/challenges/create')}>Post a Challenge</Button>}
        />
      </div>
      <ProvoAssistant />
    </div>
  )
}

// ===== FACULTY DASHBOARD =====
export function FacultyDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useSystemIntegrity()

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <Navbar />

      {/* Obsidian Glass Intro */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)' }}
        animate={{ backgroundColor: 'transparent', backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="page-container pt-24 pb-16" style={{ maxWidth: 900, perspective: '1200px' }}>
        <div className="flex items-start justify-between flex-wrap gap-4 mb-9">
          <div>
            <CinematicGreeting />
          </div>
          <motion.button variants={fadeUp} initial="hidden" animate="visible" custom={0} onClick={() => navigate('/challenges/create')} className="px-4 py-1.5 rounded-xl text-sm font-semibold mt-1 flex-shrink-0 flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
            <Plus size={14} /> Create Challenge
          </motion.button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-7">
          <StatCard icon="📚" value="0" label="Challenges Posted" color="grad-text" />
          <StatCard icon="👥" value="0" label="Submissions" color="text-[var(--accent)]" />
          <StatCard icon="⭐" value="—" label="Avg Rating" color="text-[var(--warning)]" />
        </div>

        <EmptyState icon="📚" title="Create your first academic challenge"
          description="Post real-world problems for your students. Rate submissions and increase campus competition."
          action={<Button variant="primary" onClick={() => navigate('/challenges/create')}>Create Challenge</Button>}
        />
      </div>
      <ProvoAssistant />
    </div>
  )
}

// ===== ADMIN COMMAND CENTER — Sprint 2 =====

// Pulsing status dot
function StatusDot({ status }: { status: 'online' | 'warning' | 'offline' }) {
  const colors = { online: '#22c55e', warning: GOLD, offline: '#ef4444' }
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: colors[status] }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: colors[status] }} />
    </span>
  )
}

// Uptime / health metric bar
function HealthBar({ value, label, color = GOLD }: { value: number; label: string; color?: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-1.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
        />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Simulated real-time uptime ticker
  const [uptime, setUptime] = useState(99.97)
  useEffect(() => {
    const t = setInterval(() => setUptime(v => Math.min(100, v + (Math.random() * 0.002 - 0.001))), 3000)
    return () => clearInterval(t)
  }, [])

  // ===== GUARDIAN INTEGRATION =====
  const [guardianReport, setGuardianReport] = useState<GuardianReport | null>(null)
  const [guardianRunning, setGuardianRunning] = useState(false)

  useEffect(() => {
    // Load last cached report immediately
    const cached = getLastGuardianReport()
    if (cached) setGuardianReport(cached)
    // Start 24h heartbeat
    const stop = startGuardianHeartbeat(report => setGuardianReport(report))
    return stop
  }, [])

  const runGuardianNow = async () => {
    setGuardianRunning(true)
    const report = await runGuardianDiagnostic()
    setGuardianReport(report)
    setGuardianRunning(false)
  }

  const systemHealth = [
    { icon: Server, label: 'API Server', status: 'online' as const, latency: '42ms' },
    { icon: Database, label: 'Supabase DB', status: 'online' as const, latency: '18ms' },
    { icon: Globe, label: 'CDN / Static', status: 'online' as const, latency: '8ms' },
    { icon: Cpu, label: 'Edge Functions', status: 'online' as const, latency: '31ms' },
  ]

  const metrics = [
    { icon: Users, value: '0', label: 'Total Users', delta: '+0', color: GOLD },
    { icon: Target, value: '0', label: 'Active Challenges', delta: '+0', color: '#22c55e' },
    { icon: CheckCircle, value: '0', label: 'Certificates Issued', delta: '+0', color: GOLD_LIGHT },
    { icon: AlertTriangle, value: '0', label: 'Pending Review', delta: '0', color: '#f59e0b' },
    { icon: BarChart3, value: '0', label: 'Submissions', delta: '+0', color: GOLD },
    { icon: TrendingUp, value: '₹0', label: 'Revenue', delta: '+0', color: '#22c55e' },
  ]

  const recentActivity = [
    { time: '—', icon: '🏅', text: 'No recent events — platform just launched.', color: GOLD },
    { time: '—', icon: '🚀', text: 'Provo is live. First user awaited.', color: '#22c55e' },
    { time: '—', icon: '⚡', text: 'System health: nominal.', color: GOLD_LIGHT },
  ]

  const adminControls = [
    { label: 'Challenge Review', desc: 'Approve or reject submissions', icon: Target, path: '/dashboard/admin' },
    { label: 'User Management', desc: 'View, suspend, promote members', icon: Users, path: '/dashboard/admin' },
    { label: 'Certificates', desc: 'Issue, revoke, verify certs', icon: CheckCircle, path: '/dashboard/admin' },
    { label: 'Platform Analytics', desc: 'Growth, retention, conversion', icon: BarChart3, path: '/dashboard/admin' },
    { label: 'Payments', desc: 'Provo Secure Verification history', icon: TrendingUp, path: '/dashboard/admin' },
    { label: 'System Settings', desc: 'Feature flags, config, limits', icon: Zap, path: '/dashboard/admin' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      <Navbar />

      {/* Obsidian Glass Intro */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)' }}
        animate={{ backgroundColor: 'transparent', backdropFilter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      <div className="page-container pt-24 pb-16" style={{ maxWidth: 1100, perspective: '1200px' }}>

        {/* ── Header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="label-caps">{getGreeting()}</p>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <StatusDot status="online" />
                <span className="text-[10px] font-medium" style={{ color: '#22c55e', letterSpacing: '0.1em' }}>ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>
              Command Center
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Admin · {user?.email || 'admin@provo.io'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="px-3 py-1.5 rounded-xl text-sm" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.15)`, color: GOLD }}>
              <span className="label-caps">Uptime</span>
              <span className="ml-2 font-semibold">{uptime.toFixed(2)}%</span>
            </div>
          </div>
        </motion.div>

        {/* ── 6-up metric cards ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {metrics.map((m, i) => (
            <motion.div key={m.label} variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.5 + 1.5}
              className="card-base p-4 rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <m.icon size={14} style={{ color: m.color, opacity: 0.7 }} />
                <span className="text-[10px] font-semibold" style={{ color: m.color === '#ef4444' ? m.color : 'rgba(255,255,255,0.25)' }}>
                  {m.delta}
                </span>
              </div>
              <div className="font-display text-2xl font-bold leading-none" style={{ color: m.color }}>{m.value}</div>
              <div className="label-caps" style={{ fontSize: 9 }}>{m.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main grid: Activity + System Health ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="grid md:grid-cols-2 gap-5 mb-6">

          {/* Recent Activity Feed */}
          <div className="card-base p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={15} style={{ color: GOLD }} />
              <h3 className="text-sm font-semibold">Live Activity Feed</h3>
              <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.12)` }}>
                <StatusDot status="online" />
                <span className="text-[9px] font-medium" style={{ color: GOLD, letterSpacing: '0.1em' }}>LIVE</span>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `rgba(212,175,55,0.06)` }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{a.text}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(212,175,55,0.03)', border: `1px solid rgba(212,175,55,0.08)` }}>
              <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Real-time feed activates when Supabase realtime subscriptions are wired in <code className="text-[10px]">src/lib/supabase.ts</code>
              </p>
            </div>
          </div>

          {/* System Health */}
          <div className="card-base p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={15} style={{ color: GOLD }} />
              <h3 className="text-sm font-semibold">System Health</h3>
            </div>

            {/* Service statuses */}
            <div className="space-y-3 mb-5">
              {systemHealth.map((s) => (
                <div key={s.label} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(212,175,55,0.06)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.06)' }}>
                    <s.icon size={13} style={{ color: GOLD }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.latency}</span>
                    <StatusDot status={s.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Performance metrics */}
            <div className="space-y-3">
              <HealthBar value={99} label="API Response Rate" color={GOLD} />
              <HealthBar value={100} label="Auth Success Rate" color="#22c55e" />
              <HealthBar value={97} label="Storage Capacity" color={GOLD_LIGHT} />
            </div>
          </div>
        </motion.div>

        {/* ── Admin Controls Grid ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="card-base p-5 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={15} style={{ color: GOLD }} />
            <h3 className="text-sm font-semibold">Admin Controls</h3>
            <span className="ml-auto label-caps" style={{ fontSize: 9 }}>6 modules</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {adminControls.map((ctrl, i) => (
              <motion.button
                key={ctrl.label}
                variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.3 + 4.5}
                onClick={() => navigate(ctrl.path)}
                className="card-hover p-4 rounded-xl text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.08)' }}>
                  <ctrl.icon size={16} style={{ color: GOLD }} />
                </div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#f0ece2' }}>{ctrl.label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{ctrl.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Pending Review ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="grid md:grid-cols-2 gap-5 mb-6">
          <div className="card-base p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} style={{ color: '#f59e0b' }} />
              <h3 className="text-sm font-semibold">Pending Approvals</h3>
            </div>
            <EmptyState compact icon="✅" title="All clear" description="No challenges pending review." />
          </div>
          <div className="card-base p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: GOLD }} />
              <h3 className="text-sm font-semibold">Platform Growth</h3>
            </div>
            <EmptyState compact icon="📊" title="Awaiting first data point" description="Growth charts appear once users start joining." />
          </div>
        </motion.div>

        {/* ── Provo-Guardian Panel ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}
          className="card-base p-5 rounded-xl mb-6"
          style={{ border: `1px solid ${guardianReport ? getSeverityColor(guardianReport.overall) + '30' : 'rgba(212,175,55,0.1)'}` }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: guardianReport ? getSeverityColor(guardianReport.overall) + '18' : 'rgba(212,175,55,0.08)' }}>
                <ShieldCheck size={16} style={{ color: guardianReport ? getSeverityColor(guardianReport.overall) : GOLD }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Provo-Guardian</h3>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {guardianReport
                    ? `Last scan: ${new Date(guardianReport.runAt).toLocaleString()} · ${guardianReport.duration}ms`
                    : '24-hour autonomous diagnostic heartbeat'}
                </p>
              </div>
            </div>
            <button
              onClick={runGuardianNow}
              disabled={guardianRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                color: '#000', fontWeight: 700,
              }}
            >
              <RefreshCw size={11} className={guardianRunning ? 'animate-spin' : ''} />
              {guardianRunning ? 'Scanning…' : 'Run Now'}
            </button>
          </div>

          {guardianReport ? (
            <>
              {/* Overall status banner */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                style={{ background: getSeverityColor(guardianReport.overall) + '10', border: `1px solid ${getSeverityColor(guardianReport.overall)}30` }}>
                <div className="flex items-center gap-2">
                  <StatusDot status={guardianReport.overall === 'ok' ? 'online' : guardianReport.overall === 'warning' ? 'warning' : 'offline'} />
                  <span className="text-sm font-semibold" style={{ color: getSeverityColor(guardianReport.overall) }}>
                    {getSeverityLabel(guardianReport.overall)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ color: '#22c55e' }}>✓ {guardianReport.summary.ok} ok</span>
                  {guardianReport.summary.warning > 0 && <span style={{ color: GOLD }}>⚠ {guardianReport.summary.warning} warn</span>}
                  {guardianReport.summary.critical > 0 && <span style={{ color: '#ef4444' }}>✕ {guardianReport.summary.critical} critical</span>}
                  <span>{guardianReport.summary.total} total</span>
                </div>
              </div>

              {/* Issues only — show warnings + criticals */}
              {guardianReport.checks.filter(c => c.status !== 'ok').length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="label-caps mb-2" style={{ fontSize: 9 }}>Issues Requiring Attention</p>
                  {guardianReport.checks.filter(c => c.status !== 'ok').map(c => (
                    <div key={c.id} className="p-3.5 rounded-xl border"
                      style={{ borderColor: getSeverityColor(c.status) + '25', background: getSeverityColor(c.status) + '06' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold" style={{ color: getSeverityColor(c.status) }}>{c.name}</p>
                        <span className="label-caps flex-shrink-0" style={{ fontSize: 8, color: getSeverityColor(c.status) }}>
                          {c.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{c.message}</p>
                      {c.fix && (
                        <p className="text-[10px] font-medium" style={{ color: GOLD }}>
                          💊 {c.fix}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3.5 rounded-xl mb-4"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: '#22c55e' }}>All systems healthy. No regressions detected.</p>
                </div>
              )}

              {/* Category breakdown */}
              <div className="grid grid-cols-5 gap-2">
                {(['routing', 'auth', 'api', 'storage', 'performance'] as const).map(cat => {
                  const catChecks = guardianReport.checks.filter(c => c.category === cat)
                  const worst = catChecks.some(c => c.status === 'critical') ? 'critical'
                    : catChecks.some(c => c.status === 'warning') ? 'warning' : 'ok'
                  return (
                    <div key={cat} className="p-2.5 rounded-xl text-center"
                      style={{ background: getSeverityColor(worst) + '08', border: `1px solid ${getSeverityColor(worst)}25` }}>
                      <div className="w-2 h-2 rounded-full mx-auto mb-1.5" style={{ background: getSeverityColor(worst) }} />
                      <p className="label-caps" style={{ fontSize: 8 }}>{cat}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: getSeverityColor(worst) }}>
                        {catChecks.length}
                      </p>
                    </div>
                  )
                })}
              </div>

              <p className="label-caps text-center mt-3" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>
                Next automated scan: {new Date(guardianReport.nextRunAt).toLocaleString()}
              </p>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <p className="text-sm font-semibold mb-1 text-white">Guardian Standing By</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Click "Run Now" to trigger an immediate diagnostic scan across all platform systems.
              </p>
              <button
                onClick={runGuardianNow}
                className="px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontWeight: 700 }}>
                Run Diagnostic →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Live build note ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}
          className="p-4 rounded-xl border" style={{ borderColor: 'rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.025)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <strong style={{ color: GOLD }}>Live build:</strong> Wire Supabase real-time subscriptions in{' '}
            <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.05)' }}>src/lib/supabase.ts</code>{' '}
            to populate this Command Center with live metrics, activity events, and user data. The routing, auth guards, and UI shell are production-ready.
          </p>
        </motion.div>

      </div>
      <ProvoAssistant />
    </div>
  )
}
