import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Share2, Copy, Download, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CertificatePreview from '@/components/certificate/CertificatePreview'
import { Button, Badge, EmptyState, ScoreBar, StatCard } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'

// ===== LEADERBOARD =====
export function Leaderboard() {
  const [period, setPeriod] = useState('all')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 760 }}>
        <div className="mb-9">
          <p className="label-caps mb-2">Rankings</p>
          <h1 className="font-display flex items-center gap-3" style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>
            <span>🏆</span> Leaderboard
          </h1>
          <p className="text-sm text-[var(--text-2)] mt-2">Top performers ranked by Provo Score</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-white/[0.02] w-fit mb-8">
          {[['all', 'All Time'], ['month', 'This Month'], ['week', 'This Week']].map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: period === val ? 'var(--primary)' : 'transparent', color: period === val ? '#fff' : 'var(--text-2)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <EmptyState icon="🏆" title="No rankings yet"
          description="Complete challenges to appear here. The leaderboard updates as submissions are accepted and rated."
          action={<Button variant="primary" size="sm" onClick={() => window.location.href = '/challenges'}>Start Solving</Button>}
        />

        {/* Score explanation */}
        <div className="card-base p-5 rounded-xl mt-8">
          <div className="flex items-center gap-2 mb-4"><span>📈</span><h4 className="text-sm font-semibold">How Provo Score Works</h4></div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[['🏅', 'Challenges Solved', 'Each accepted submission adds points'],['⭐', 'Ratings Received', 'Higher stars = higher score boost'],['🥇', 'Wins', 'Winner selection gives maximum points']].map(([ico, title, desc]) => (
              <div key={title as string}>
                <div className="text-2xl mb-2">{ico}</div>
                <div className="text-xs font-semibold mb-1">{title}</div>
                <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ===== OPPORTUNITIES =====
export function Opportunities() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16">
        <div className="mb-9">
          <p className="label-caps mb-2">Hiring Layer</p>
          <h1 className="font-display" style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>Opportunities</h1>
          <p className="text-sm mt-2" style={{ maxWidth: 480 }}>
            Top-ranked students get direct hiring visibility. Companies hire based on Provo Score, not resumes.
          </p>
        </div>

        {/* How it works */}
        <div className="card-base p-5 rounded-xl mb-10" style={{ borderColor: 'rgba(79,126,248,0.1)' }}>
          <div className="flex items-center gap-2 mb-5"><span>📈</span><h4 className="text-sm font-semibold">How Opportunities Work</h4></div>
          <div className="grid grid-cols-3 gap-5 text-center">
            {[['🎯','01','Solve Challenges','Build your proof portfolio and Provo Score'],['⭐','02','Get Ranked','Earn high ratings, climb the leaderboard'],['💼','03','Get Hired','Companies reach out based on your score']].map(([ico,num,t,d]) => (
              <div key={t as string} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-dim)] border border-[rgba(79,126,248,0.2)] flex items-center justify-center text-xl">{ico}</div>
                <span className="label-caps">{num}</span>
                <span className="text-sm font-semibold">{t}</span>
                <p className="text-xs text-[var(--text-3)]">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="rounded-2xl border border-[var(--border)] p-16 text-center" style={{ background: 'linear-gradient(135deg, var(--card) 0%, rgba(79,126,248,0.04) 100%)' }}>
          <div className="w-20 h-20 rounded-full bg-[var(--primary-dim)] border border-[rgba(79,126,248,0.2)] flex items-center justify-center text-4xl mx-auto mb-6">💼</div>
          <h2 className="font-display mb-3" style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700 }}>Hiring Partners Coming Soon</h2>
          <p className="text-sm" style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            We're onboarding companies right now. As students build strong Provo Scores, companies will actively post hiring opportunities here.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-7">
            <Badge variant="primary">Early Access</Badge>
            <Badge variant="accent">Live Q1 2026</Badge>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02] inline-block text-left max-w-sm">
            <p className="text-xs text-[var(--text-3)] mb-1.5 uppercase tracking-widest">For Business Inquiries</p>
            <p className="text-sm text-[var(--text-2)]">Want to post challenges and hire from Provo?</p>
            <a href="mailto:vansh.lohiaknp@gmail.com" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-gradient-to-br from-[#4f7ef8] to-[#7c55f0] text-white text-sm font-semibold hover:brightness-110 transition-all">
              Contact {user?.full_name?.split(' ')[0] || 'Us'} →
            </a>
          </div>
        </div>

        <div className="card-base p-7 mt-8 text-center rounded-2xl">
          <h3 className="font-display mb-2" style={{ fontSize: 'clamp(20px,3vw,28px)' }}>Not ranked yet?</h3>
          <p className="text-sm mb-5">Solve challenges, build your Provo Score, and unlock hiring visibility when companies go live.</p>
          <Button variant="primary" onClick={() => navigate('/challenges')}>Browse Challenges</Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ===== PROOF PROFILE =====
export function ProofProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="mb-4">Please sign in to view your profile.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 760 }}>
        <p className="label-caps mb-3">Profile</p>

        {/* Identity card */}
        <div className="card-base p-7 rounded-2xl mb-5">
          <div className="flex items-start gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f7ef8] to-[#7c55f0] flex items-center justify-center font-display text-xl font-bold text-white flex-shrink-0">
              {getInitials(user.full_name)}
            </div>
            <div>
              <h1 className="font-display" style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 700 }}>{user.full_name}</h1>
              <p className="label-caps mt-1">{user.college || user.company || ''}</p>
              {user.bio && <p className="text-sm text-[var(--text-2)] mt-2 leading-relaxed">{user.bio}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon="🎯" value={user.challenges_solved || 0} label="Solved" color="text-[var(--primary)]" />
            <StatCard icon="⭐" value={user.rating ? String(user.rating) : '—'} label="Rating" color="text-[var(--warning)]" />
            <StatCard icon="🏅" value="0" label="Certs" color="text-[var(--gold)]" />
            <StatCard icon="📈" value={user.provo_score || 0} label="Score" color="text-[var(--accent)]" />
          </div>

          <ScoreBar score={user.provo_score || 0} />
        </div>

        {/* Skills */}
        <div className="card-base p-5 rounded-xl mb-5">
          <h3 className="text-sm font-semibold mb-4">Skills</h3>
          {user.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map(s => <Badge key={s} variant="primary">{s}</Badge>)}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-3)]">No skills added yet.</p>
          )}
        </div>

        {/* Certificates */}
        <div className="card-base p-5 rounded-xl mb-5">
          <div className="flex items-center gap-2 mb-4"><span>🏅</span><h3 className="text-sm font-semibold">Certificates</h3></div>
          <EmptyState compact icon="🏅" title="No certificates yet"
            description="Get accepted on challenges to earn certificates."
          />
        </div>

        {/* Share */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" className="flex-1" style={{ minWidth: 150 }}
            onClick={() => {
              const url = window.location.href
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
            }}>
            <Share2 size={14} /> Share on LinkedIn
          </Button>
          <Button variant="outline" className="flex-1" style={{ minWidth: 150 }}
            onClick={() => { navigator.clipboard.writeText(window.location.href) }}>
            <Copy size={14} /> Copy Profile Link
          </Button>
        </div>
      </div>
    </div>
  )
}

// ===== CERTIFICATE VERIFY =====
export function CertificateVerify() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleDownload = () => {
    alert('PDF download available in the live build via print API.')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 760 }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text)] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[var(--accent)] text-base">✓</span>
          <span className="text-sm font-medium text-[var(--accent)]">Verified Certificate</span>
          <span className="text-[var(--text-3)] mx-1 text-sm">·</span>
          <span className="font-mono text-xs text-[var(--text-2)]">PROVO-DEMO-XXXX</span>
        </div>
        <CertificatePreview
          studentName={user?.full_name || 'Student Name'}
          challengeTitle="Sample Challenge Title"
          companyName="Demo Company"
          onDownload={handleDownload}
        />
      </div>
    </div>
  )
}

// ===== NOTIFICATIONS =====
export function Notifications() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container pt-24 pb-16" style={{ maxWidth: 680 }}>
        <div className="mb-9">
          <p className="label-caps mb-2">Inbox</p>
          <h1 className="font-display" style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 700 }}>Notifications</h1>
        </div>
        <EmptyState icon="🔔" title="No notifications yet"
          description="You'll receive updates here when your submissions are reviewed, challenges go live, or you earn a certificate."
        />
      </div>
    </div>
  )
}

// ===== NOT FOUND =====
export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center p-8">
        <div className="text-6xl mb-5">404</div>
        <h1 className="font-display text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-sm mb-6">The page you're looking for doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    </div>
  )
}
