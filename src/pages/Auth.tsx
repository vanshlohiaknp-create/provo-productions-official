import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input } from '@/components/ui'
import type { UserRole } from '@/types'

// ===== LOGIN PAGE =====
export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, demoLogin } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true); setError('')
    try {
      await signIn(email, password)
      navigate('/welcome')
    } catch (err: any) {
      setError(err.message || 'Sign in failed.')
    } finally { setLoading(false) }
  }

  const handleDemo = (role: UserRole) => {
    demoLogin(role)
    navigate('/welcome')
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: 'var(--bg)' }}>
      {/* Left */}
      <div className="hidden md:flex flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(79,126,248,0.1) 0%, var(--bg) 60%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4f7ef8] to-[#7c55f0] flex items-center justify-center font-display font-bold text-white">P</div>
          <span className="font-display text-lg font-bold">Provo</span>
        </Link>
        <div className="relative z-10 py-10">
          <p className="label-caps mb-3">Welcome back</p>
          <h2 className="font-display mb-4" style={{ fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700 }}>
            Skills that speak<br /><span className="grad-text italic">louder than paper.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ maxWidth: 300 }}>
            Sign in to continue solving challenges and building your proof portfolio.
          </p>
          <div className="card-base p-4 mt-8" style={{ maxWidth: 300 }}>
            <div className="text-amber-400 text-sm mb-2">★★★★★</div>
            <p className="text-sm italic leading-relaxed">"Got hired because of my Provo certificate. No interview required."</p>
            <p className="label-caps mt-2">— Early User, Delhi</p>
          </div>
        </div>
        <p className="label-caps relative z-10">Trusted by early adopters across India</p>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-8 md:p-12" style={{ background: 'var(--bg-2)' }}>
        <div className="w-full max-w-[380px]">
          <Link to="/" className="text-xs text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1 mb-8 transition-colors">
            ← Back to home
          </Link>
          <p className="label-caps mb-2">Sign in</p>
          <h1 className="font-display text-[28px] font-bold mb-7">Welcome back to Provo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" variant="primary" fullWidth loading={loading} style={{ height: 44, marginTop: 4 }}>
              Sign In
            </Button>
          </form>
          <div className="mt-5 pt-5 border-t border-[var(--border)] text-center text-sm text-[var(--text-2)]">
            No account? <Link to="/signup" className="text-[var(--primary)] font-semibold hover:underline">Create one free</Link>
          </div>
          <div className="mt-5 p-4 rounded-xl border border-[var(--border)] bg-white/[0.02]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-3)] text-center mb-3">Quick demo login</p>
            <div className="grid grid-cols-2 gap-2">
              {(['student','business','faculty','admin'] as UserRole[]).map(r => (
                <Button key={r} variant="outline" size="sm" onClick={() => handleDemo(r)}>
                  {r === 'student' ? '👨‍🎓' : r === 'business' ? '🏢' : r === 'faculty' ? '📚' : '🛡️'} {r.charAt(0).toUpperCase()+r.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== SIGNUP PAGE =====
export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) { setError('Please enter your name.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      await signUp(name, email, password, role)
      navigate('/welcome')
    } catch (err: any) {
      setError(err.message || 'Sign up failed.')
    } finally { setLoading(false) }
  }

  const GOLD = '#D4AF37'
  const GOLD_DIM = 'rgba(212,175,55,0.12)'
  const GOLD_BORDER = 'rgba(212,175,55,0.35)'

  const roles: { id: UserRole; icon: string; label: string; desc: string }[] = [
    { id: 'student', icon: '🎓', label: 'Student', desc: 'Solve challenges' },
    { id: 'faculty', icon: '📚', label: 'Faculty', desc: 'Post academic work' },
    { id: 'business', icon: '🏢', label: 'Business', desc: 'Discover talent' },
  ]

  return (
    <div className="min-h-screen grid md:grid-cols-2" style={{ background: '#000000' }}>
      {/* Left — Hero panel */}
      <div className="hidden md:flex flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.06) 0%, #000000 65%)' }}>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Gold corner glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }} />

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-black"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #F5D77A)` }}>P</div>
          <span className="font-display text-lg font-bold text-white">Provo</span>
        </Link>

        <div className="relative z-10 py-10">
          <p className="mb-3" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>Join the ecosystem</p>
          <h2 className="font-display mb-5" style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, lineHeight: 1.15, color: '#fff' }}>
            Prove your skills.<br />
            <span style={{
              background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontStyle: 'italic',
            }}>Get hired.</span>
          </h2>
          <div className="space-y-3">
            {['Verified proof-of-work certificates','Real challenges from companies','Ranked leaderboard system','Direct hiring visibility'].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ color: GOLD }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.5)' }} className="relative z-10">Free to join · No credit card required</p>
      </div>

      {/* Right — Signup form with glassmorphism */}
      <div className="flex items-center justify-center p-8 md:p-12" style={{ background: '#000000' }}>
        <div className="w-full max-w-[420px] rounded-2xl p-8 md:p-10 relative"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 8px 64px -12px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>

          <Link to="/" className="text-xs flex items-center gap-1 mb-7 transition-colors hover:opacity-100" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Back to home
          </Link>
          <p className="mb-2" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>Create account</p>
          <h1 className="font-display text-[28px] font-bold mb-6 text-white">Join Provo</h1>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {roles.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className="p-3.5 rounded-xl border text-center transition-all duration-200"
                style={{
                  background: role === r.id ? GOLD_DIM : 'rgba(255,255,255,0.03)',
                  borderColor: role === r.id ? GOLD_BORDER : 'rgba(255,255,255,0.07)',
                  color: role === r.id ? GOLD : 'rgba(255,255,255,0.45)',
                }}
              >
                <div className="text-xl mb-1">{r.icon}</div>
                <div className="text-xs font-semibold">{r.label}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <Input label="Full Name" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="Minimum 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm"
              style={{
                height: 48,
                marginTop: 8,
                background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`,
                color: '#000000',
                fontWeight: 700,
                letterSpacing: '0.02em',
                boxShadow: '0 0 32px -6px rgba(212,175,55,0.4)',
              }}
            >
              {loading ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin-slow" /> : null}
              Create Account
            </button>
          </form>
          <div className="mt-5 pt-5 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
            Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: GOLD }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export type AuthMode = 'login' | 'signup'

export default function Auth({ mode }: { mode: AuthMode }) {
  return mode === 'login' ? <Login /> : <Signup />
}
