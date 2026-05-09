import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  demoLogin: (role: UserRole) => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'provo_user'

const DEMO_USERS: Record<UserRole, User> = {
  student: {
    id: 'demo-student-1',
    email: 'student@provo.io',
    full_name: 'Demo User',
    role: 'student',
    college: 'Allenhouse Group · CSJMU, Kanpur',
    bio: 'BBA/MBA student. Solving real problems one challenge at a time.',
    skills: ['Digital Marketing', 'GTM Strategy', 'Growth'],
    provo_score: 0,
    challenges_solved: 0,
    created_at: new Date().toISOString(),
  },
  business: {
    id: 'demo-business-1',
    email: 'business@provo.io',
    full_name: 'My Company',
    role: 'business',
    company: 'Demo Company',
    provo_score: 0,
    challenges_solved: 0,
    created_at: new Date().toISOString(),
  },
  faculty: {
    id: 'demo-faculty-1',
    email: 'faculty@provo.io',
    full_name: 'Dr. Sharma',
    role: 'faculty',
    college: 'CSJMU, Kanpur',
    provo_score: 0,
    challenges_solved: 0,
    created_at: new Date().toISOString(),
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@provo.io',
    full_name: 'Admin',
    role: 'admin',
    provo_score: 0,
    challenges_solved: 0,
    created_at: new Date().toISOString(),
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const persist = useCallback((u: User | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(u)
  }, [])

  const signIn = useCallback(async (email: string, _password: string) => {
    // In live build: replace with Supabase signInWithPassword
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      role: 'student',
      provo_score: 0,
      challenges_solved: 0,
      created_at: new Date().toISOString(),
    }
    persist(mockUser)
    setLoading(false)
  }, [persist])

  const signUp = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: name,
      role,
      provo_score: 0,
      challenges_solved: 0,
      created_at: new Date().toISOString(),
    }
    persist(newUser)
    setLoading(false)
  }, [persist])

  const demoLogin = useCallback((role: UserRole) => {
    persist(DEMO_USERS[role])
  }, [persist])

  const signOut = useCallback(async () => {
    setIsLoggingOut(true)
    await new Promise(r => setTimeout(r, 2000))
    persist(null)
    setIsLoggingOut(false)
  }, [persist])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    persist(updated)
  }, [user, persist])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggingOut,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      demoLogin,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
