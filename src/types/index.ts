// ===== USER TYPES =====
export type UserRole = 'student' | 'faculty' | 'business' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  college?: string
  company?: string
  bio?: string
  skills?: string[]
  rating?: number
  provo_score: number
  challenges_solved: number
  created_at: string
  tier?: string
}

// ===== AUTH =====
export interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

// ===== CHALLENGE =====
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard'
export type ChallengeStatus = 'pending' | 'active' | 'closed' | 'rejected'

export interface Challenge {
  id: string
  title: string
  company_name: string
  description: string
  reward: string
  deadline: string
  difficulty: ChallengeDifficulty
  tags: string[]
  status: ChallengeStatus
  applicant_count: number
  view_count: number
  created_by: string
  created_at: string
  is_sample?: boolean
}

// ===== SUBMISSION =====
export type SubmissionStatus = 'submitted' | 'accepted' | 'rejected' | 'winner'

export interface Submission {
  id: string
  challenge_id: string
  challenge_title?: string
  company_name?: string
  student_id: string
  content: string
  link_url?: string
  file_url?: string
  status: SubmissionStatus
  rating?: number
  feedback?: string
  created_at: string
}

// ===== CERTIFICATE =====
export interface Certificate {
  id: string
  student_id: string
  student_name: string
  challenge_id: string
  challenge_title: string
  company_name: string
  certificate_code: string
  skills?: string[]
  score?: number
  issued_at: string
}

// ===== MCQ =====
export interface MCQQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  topic: string
  explanation?: string
}

export interface MCQResult {
  score: number
  total: number
  accuracy: number
  correct: number
  wrong: number
  skipped: number
  timeTaken: number
  weakAreas: { topic: string; wrong: number }[]
  answers: number[]
  category: string
}

export interface ChallengeGateResult {
  challengeId: string
  score: number
  total: number
  passed: boolean
  accuracy: number
  weakAreas: { topic: string; wrong: number }[]
  missedQs: MCQQuestion[]
  passedAt: string
}

// ===== PRICING =====
export interface PricingPlan {
  id: string
  name: string
  price: string
  razorpayAmount: number
  features: any[]
  popular: boolean
}

// ===== NOTIFICATION =====
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'certificate'
  read: boolean
  created_at: string
}

// ===== PAYMENT =====
export type PaymentStatus = 'idle' | 'loading' | 'success' | 'failure'

export interface PaymentResult {
  status: PaymentStatus
  planName?: string
  orderId?: string
  message?: string
}
