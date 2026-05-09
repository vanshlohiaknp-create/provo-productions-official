import React from 'react'
import { cn } from '@/lib/utils'

const GOLD = '#D4AF37'
const GOLD_GRAD = 'linear-gradient(135deg, #D4AF37, #F5D77A)'

// ===== BUTTON =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gold'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'outline', size = 'md', loading, fullWidth, children, disabled, style, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none'
    const variants = {
      primary: '',
      outline: '',
      ghost: '',
      danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15',
      success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/15',
      gold: '',
    }
    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-[15px]',
      icon: 'p-2 text-sm',
    }

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: GOLD_GRAD,
        color: '#000',
        fontWeight: 700,
        boxShadow: '0 0 28px -6px rgba(212,175,55,0.4)',
      },
      outline: {
        background: 'transparent',
        color: '#fff',
        border: 'none',
        boxShadow: '0 0 0 0.5px rgba(212,175,55,0.3)',
      },
      ghost: {
        background: 'transparent',
        color: 'rgba(255,255,255,0.5)',
      },
      gold: {
        background: GOLD_GRAD,
        color: '#000',
        fontWeight: 700,
      },
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" /> : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ===== BADGE =====
interface BadgeProps {
  variant?: 'primary' | 'accent' | 'gold' | 'warning' | 'danger' | 'muted'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'muted', children, className }: BadgeProps) {
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'rgba(212,175,55,0.08)', color: GOLD, border: 'none', boxShadow: '0 0 0 0.5px rgba(212,175,55,0.3)' },
    accent: { background: 'rgba(212,175,55,0.08)', color: GOLD, border: 'none', boxShadow: '0 0 0 0.5px rgba(212,175,55,0.3)' },
    gold: { background: 'rgba(212,175,55,0.08)', color: GOLD, border: 'none', boxShadow: '0 0 0 0.5px rgba(212,175,55,0.3)' },
    warning: { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'none', boxShadow: '0 0 0 0.5px rgba(245,158,11,0.3)' },
    danger: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', boxShadow: '0 0 0 0.5px rgba(239,68,68,0.3)' },
    muted: { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: 'none', boxShadow: '0 0 0 0.5px rgba(212,175,55,0.15)' },
  }
  return (
    <span className={cn('badge-base', className)} style={variants[variant]}>
      {children}
    </span>
  )
}

// ===== CARD =====
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(hover ? 'card-hover' : 'card-base', 'p-5', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ===== EMPTY STATE =====
interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

export function EmptyState({ icon = '📭', title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center rounded-2xl',
      compact ? 'py-10 px-6' : 'py-16 px-8'
    )} style={{
      border: 'none',
      boxShadow: '0 0 0 0.5px rgba(212,175,55,0.2)',
      background: 'rgba(255,255,255,0.015)',
    }}>
      <span className={cn('block opacity-60', compact ? 'text-4xl mb-3' : 'text-5xl mb-4')}>{icon}</span>
      <h3 className={cn('font-display font-semibold text-white', compact ? 'text-base mb-2' : 'text-xl mb-3')}>
        {title}
      </h3>
      {description && (
        <p className={cn('max-w-xs', compact ? 'text-xs' : 'text-sm')} style={{ lineHeight: 1.65, color: 'rgba(255,255,255,0.25)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ===== INPUT =====
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-white mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg px-3.5 py-2.5 text-sm font-body text-white outline-none transition-colors',
            error && 'border-red-500/50',
            className
          )}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: 'none',
            boxShadow: '0 0 0 0.5px rgba(212,175,55,0.2)',
            color: '#fff',
          }}
          onFocus={e => e.target.style.boxShadow = '0 0 0 0.5px rgba(212,175,55,0.5), 0 0 12px rgba(212,175,55,0.1)'}
          onBlur={e => e.target.style.boxShadow = '0 0 0 0.5px rgba(212,175,55,0.2)'}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ===== TEXTAREA =====
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-white mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-lg px-3.5 py-2.5 text-sm font-body text-white outline-none transition-colors resize-vertical min-h-[100px]',
            className
          )}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: 'none',
            boxShadow: '0 0 0 0.5px rgba(212,175,55,0.2)',
          }}
          onFocus={e => e.target.style.boxShadow = '0 0 0 0.5px rgba(212,175,55,0.5), 0 0 12px rgba(212,175,55,0.1)'}
          onBlur={e => e.target.style.boxShadow = '0 0 0 0.5px rgba(212,175,55,0.2)'}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ===== SELECT =====
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full rounded-lg px-3.5 py-2.5 text-sm font-body text-white outline-none transition-colors cursor-pointer',
          className
        )}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: 'none',
          boxShadow: '0 0 0 0.5px rgba(212,175,55,0.2)',
        }}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: '#0a0a0a' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ===== STAT CARD =====
interface StatCardProps {
  icon: string
  value: string | number
  label: string
  color?: string
}

export function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="card-base p-5 transition-colors">
      <span className="block text-lg mb-3">{icon}</span>
      <div className="font-display text-2xl font-bold leading-none mb-1" style={{ color: color || GOLD }}>{value}</div>
      <div className="label-caps">{label}</div>
    </div>
  )
}

// ===== LOADING SPINNER =====
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-10 h-10' }
  return (
    <div className={cn('border-2 rounded-full animate-spin-slow', sizes[size])}
      style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: GOLD }} />
  )
}

// ===== PAGE LOADER =====
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

// ===== TOAST =====
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div
      className="fixed bottom-24 right-6 z-[999] card-base p-4 max-w-sm animate-slide-in flex items-start gap-3 shadow-xl"
      style={{ borderColor: type === 'success' ? 'rgba(212,175,55,0.3)' : type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.1)' }}
    >
      <span>{icons[type]}</span>
      <p className="text-sm text-white font-body flex-1">{message}</p>
      <button onClick={onClose} className="text-lg leading-none" style={{ color: 'rgba(255,255,255,0.3)' }}>×</button>
    </div>
  )
}

// ===== SCORE BAR =====
interface ScoreBarProps {
  score: number
  max?: number
  className?: string
}

export function ScoreBar({ score, max = 200, className }: ScoreBarProps) {
  const pct = Math.min((score / max) * 100, 100)
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <span className="text-sm font-semibold text-white">Provo Score</span>
        </div>
        <span className="font-display text-xl font-bold" style={{ color: GOLD }}>{score}</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="score-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between">
        <span className="label-caps">0</span>
        <span className="label-caps">{max} max</span>
      </div>
    </div>
  )
}

export * from './CinematicGreeting'

