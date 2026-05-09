import { Suspense, useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui'
import { startGuardianHeartbeat } from '@/lib/guardian'

// Pages
import Index from '@/pages/Index'
import Welcome from '@/pages/Welcome'
import Auth from '@/pages/Auth'
import { Challenges, ChallengeDetail, SubmitSolution, CreateChallenge } from '@/pages/Challenges'
import { MCQSelect, MCQTest, MCQResults } from '@/pages/MCQ'
import { StudentDashboard, BusinessDashboard, FacultyDashboard, AdminDashboard } from '@/pages/Dashboards'
import { Leaderboard, Opportunities, ProofProfile, CertificateVerify, Notifications, NotFound } from '@/pages/Pages'

// ===== HOLY GRAIL LOADING SCREEN =====
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="loading-screen"
    >
      <div className="logo-3d">P</div>
      <div className="gold-progress-track">
        <div className="gold-progress-fill" />
      </div>
      <p style={{
        marginTop: 20,
        fontSize: 11,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: 'rgba(212,175,55,0.4)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 500,
      }}>
        PROVO
      </p>
    </motion.div>
  )
}

// ===== CINEMATIC LOGOUT SCREEN =====
function LogoutScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#050505' }}
    >
      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ scale: 1, opacity: 0, filter: 'blur(4px)' }}
          animate={{ scale: 0.95, opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            scale: { duration: 2.5, ease: "linear" },
            opacity: { duration: 0.8 },
            filter: { duration: 0.8 }
          }}
          className="font-display text-2xl md:text-3xl text-white font-medium tracking-wide"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Exiting Provo. Excellence is a habit, not an act.
        </motion.h1>
      </div>
    </motion.div>
  )
}

// ===== GOLDEN CURSOR TRAIL =====
function GoldenCursorTrail() {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const dot = document.createElement('div')
      dot.className = 'cursor-trail'
      dot.style.left = `${e.clientX}px`
      dot.style.top = `${e.clientY}px`
      document.body.appendChild(dot)
      setTimeout(() => dot.remove(), 600)
    }

    let throttle = false
    const throttledMove = (e: MouseEvent) => {
      if (throttle) return
      throttle = true
      handleMove(e)
      setTimeout(() => { throttle = false }, 40)
    }

    window.addEventListener('mousemove', throttledMove)
    return () => window.removeEventListener('mousemove', throttledMove)
  }, [])

  return null
}

// ===== PROTECTED ROUTE =====
function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

// ===== GUEST ONLY =====
function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

// ===== APP ROUTES =====
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<GuestOnly><Auth mode="login" /></GuestOnly>} />
        {/* Explicit signup route mapping for the central Auth flow */}
        <Route path="/signup" element={<GuestOnly><Auth mode="signup" /></GuestOnly>} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/opportunities" element={<Opportunities />} />
        <Route path="/certificate/:code" element={<CertificateVerify />} />

        {/* Protected */}
        <Route path="/welcome" element={<RequireAuth><Welcome /></RequireAuth>} />
        <Route path="/challenges/:id/submit" element={<RequireAuth roles={['student']}><SubmitSolution /></RequireAuth>} />
        <Route path="/challenges/create" element={<RequireAuth roles={['business','faculty','admin']}><CreateChallenge /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProofProfile /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        {/* MCQ */}
        <Route path="/mcq" element={<MCQSelect />} />
        <Route path="/mcq/test" element={<MCQTest />} />
        <Route path="/mcq/results" element={<MCQResults />} />

        {/* Dashboards */}
        <Route path="/dashboard/student" element={<RequireAuth roles={['student']}><StudentDashboard /></RequireAuth>} />
        <Route path="/dashboard/business" element={<RequireAuth roles={['business']}><BusinessDashboard /></RequireAuth>} />
        <Route path="/dashboard/faculty" element={<RequireAuth roles={['faculty']}><FacultyDashboard /></RequireAuth>} />
        <Route path="/dashboard/admin" element={<RequireAuth roles={['admin']}><AdminDashboard /></RequireAuth>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function RootController() {
  const { loading, isLoggingOut } = useAuth()
  const [showLoading, setShowLoading] = useState(true)

  // Trigger loading screen on auth.loading (e.g. login)
  useEffect(() => {
    if (loading) setShowLoading(true)
  }, [loading])

  return (
    <>
      <GoldenCursorTrail />
      <AnimatePresence mode="wait">
        {isLoggingOut ? (
          <LogoutScreen key="logout" />
        ) : showLoading ? (
          <LoadingScreen key="loading" onComplete={() => setShowLoading(false)} />
        ) : (
          <motion.div
            key="app-routes"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="cinematic-enter min-h-screen"
          >
            <AppRoutes />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  useEffect(() => {
    const stopHeartbeat = startGuardianHeartbeat()
    return () => stopHeartbeat()
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <RootController />
      </AuthProvider>
    </BrowserRouter>
  )
}
