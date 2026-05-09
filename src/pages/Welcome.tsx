import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, Award, BarChart3, Plus, Users, ShieldCheck, Star, Trophy, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getGreeting } from '@/lib/utils'

const GOLD = '#D4AF37'

interface ActionItem {
  icon: React.ElementType
  label: string
  desc: string
  path: string
  primary?: boolean
}

const ACTIONS: Record<string, ActionItem[]> = {
  student: [
    { icon: Target, label: 'Solve a Challenge', desc: 'Browse open real-world problems', path: '/challenges', primary: true },
    { icon: BookOpen, label: 'MCQ Mode', desc: 'Test your knowledge, earn score', path: '/mcq' },
    { icon: Award, label: 'My Certificates', desc: 'View your verified credentials', path: '/dashboard/student' },
    { icon: BarChart3, label: 'Leaderboard', desc: 'See your Provo Score ranking', path: '/leaderboard' },
  ],
  business: [
    { icon: Plus, label: 'Post a Challenge', desc: 'Discover verified talent', path: '/challenges/create', primary: true },
    { icon: Users, label: 'View Dashboard', desc: 'Review submissions and activity', path: '/dashboard/business' },
    { icon: Target, label: 'Find Talent', desc: 'Browse top-ranked students', path: '/opportunities' },
  ],
  faculty: [
    { icon: Plus, label: 'Create a Challenge', desc: 'Post academic problems', path: '/challenges/create', primary: true },
    { icon: Users, label: 'Review Submissions', desc: 'Rate and give feedback', path: '/dashboard/faculty' },
    { icon: BarChart3, label: 'Leaderboard', desc: 'See student rankings', path: '/leaderboard' },
  ],
  admin: [
    { icon: ShieldCheck, label: 'Review Challenges', desc: 'Pending approvals', path: '/dashboard/admin', primary: true },
    { icon: Users, label: 'Manage Users', desc: 'Platform members', path: '/dashboard/admin' },
    { icon: BarChart3, label: 'Platform Analytics', desc: 'Real-time data', path: '/dashboard/admin' },
  ],
}

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const role = user?.role || 'student'
  const actions = ACTIONS[role] || ACTIONS.student

  const handleNav = (path: string) => {
    setLoading(path)
    setTimeout(() => navigate(path), 500)
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#000' }}>
      {/* Bg — subtle gold radial */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 25% 40%, rgba(212,175,55,0.04) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.02) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="text-center">
            <div className="w-7 h-7 border-2 rounded-full animate-spin-slow mx-auto mb-4" style={{ borderColor: GOLD, borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</p>
          </div>
        </div>
      )}

      <div className="page-container relative z-10 py-20 w-full">
        <div className="max-w-[540px]">
          {/* Cinematic Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: GOLD, marginBottom: 8 }}
          >
            {getGreeting()}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black leading-none mb-2"
            style={{ fontSize: 'clamp(44px, 7vw, 80px)', letterSpacing: '-0.03em', color: '#fff' }}
          >
            {firstName}<span style={{ color: GOLD }}>.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg mb-10" 
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
          >
            What would you like to build today?
          </motion.p>

          {/* Actions */}
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2.5 mb-9"
          >
            {actions.map((action) => (
              <motion.button
                variants={itemVars}
                key={action.label}
                onClick={() => handleNav(action.path)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all hover:-translate-y-0.5 group w-full"
                style={{
                  background: action.primary ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: action.primary ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.06)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    background: action.primary ? `linear-gradient(135deg, ${GOLD}, #F5D77A)` : 'rgba(255,255,255,0.05)',
                  }}>
                  <action.icon size={18} style={{ color: action.primary ? '#000' : 'rgba(255,255,255,0.4)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: action.primary ? GOLD : '#fff' }}>
                    {action.label}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{action.desc}</p>
                </div>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-all flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }} />
              </motion.button>
            ))}
          </motion.div>

          {/* Stats for students */}
          {role === 'student' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {(user?.challenges_solved || 0) === 0 ? (
                <div className="glass-card flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}>
                  <Award size={18} style={{ color: GOLD, flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Solve your first challenge to earn your first certificate.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Trophy, v: user?.challenges_solved || 0, l: 'Solved', c: GOLD },
                    { icon: Award, v: 0, l: 'Certificates', c: '#F5D77A' },
                    { icon: Star, v: user?.rating || '—', l: 'Rating', c: '#f59e0b' },
                  ].map(s => (
                    <div key={s.l} className="glass-card flex items-center gap-3 px-4 py-3.5 rounded-xl">
                      <s.icon size={17} style={{ color: s.c, flexShrink: 0 }} />
                      <div>
                        <div className="font-display text-xl font-bold leading-none" style={{ color: s.c }}>{String(s.v)}</div>
                        <div className="label-caps mt-0.5">{s.l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Business onboarding */}
          {role === 'business' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="glass-card flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{ borderColor: 'rgba(212,175,55,0.15)', background: 'rgba(212,175,55,0.04)' }}
            >
              <Plus size={18} style={{ color: GOLD, flexShrink: 0 }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Post your first challenge to discover verified talent.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
