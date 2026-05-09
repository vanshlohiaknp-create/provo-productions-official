import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui'

const GOLD = '#D4AF37'

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const dashPath = () => {
    if (!user) return '/'
    const map: Record<string, string> = {
      student: '/dashboard/student',
      business: '/dashboard/business',
      faculty: '/dashboard/faculty',
      admin: '/dashboard/admin',
    }
    return map[user.role] || '/'
  }

  const navLinks = [
    { to: '/challenges', label: 'Challenges' },
    { to: '/mcq', label: 'MCQ Mode' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/opportunities', label: 'Opportunities' },
  ]

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid rgba(212,175,55,0.1)`,
    }}>
      <div className="max-w-[1160px] mx-auto px-10 h-[62px] flex items-center justify-between gap-4">
        {/* Logo + VANSH */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center font-display font-bold text-black text-[15px]"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`,
              boxShadow: '0 0 24px -4px rgba(212,175,55,0.5)',
            }}>
            P
          </div>
          <span className="font-display text-[18px] font-bold text-white">Provo</span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.3em',
            color: GOLD,
            opacity: 0.7,
            marginLeft: 4,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>VANSH</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive(link.to) ? GOLD : 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={e => { if (!isActive(link.to)) (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { if (!isActive(link.to)) (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(dashPath())}>
                Dashboard
              </Button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors relative"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                <Bell size={16} />
              </button>
              <Link to="/profile">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xs font-bold text-black cursor-pointer transition-shadow"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`,
                    boxShadow: '0 0 20px -4px rgba(212,175,55,0.4)',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px -2px rgba(212,175,55,0.6)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px -4px rgba(212,175,55,0.4)'}
                >
                  {getInitials(user.full_name)}
                </div>
              </Link>
              <button
                onClick={() => { signOut(); navigate('/') }}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-all"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.25)'}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log in</Button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`,
                  color: '#000',
                  boxShadow: '0 0 20px -6px rgba(212,175,55,0.4)',
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-5 pb-5 pt-3" style={{
          borderTop: '1px solid rgba(212,175,55,0.08)',
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(24px)',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm font-medium transition-colors"
              style={{
                color: isActive(link.to) ? GOLD : 'rgba(255,255,255,0.5)',
                borderBottom: '1px solid rgba(212,175,55,0.06)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            {isAuthenticated && user ? (
              <>
                <Button variant="ghost" size="sm" fullWidth onClick={() => { navigate(dashPath()); setMobileOpen(false) }}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" fullWidth onClick={() => { signOut(); navigate('/'); setMobileOpen(false) }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false) }}>Log in</Button>
                <button
                  onClick={() => { navigate('/signup'); setMobileOpen(false) }}
                  className="w-full py-2 rounded-xl text-sm font-semibold"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #F5D77A)`, color: '#000' }}
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
