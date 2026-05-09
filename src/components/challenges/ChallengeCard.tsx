import { useNavigate } from 'react-router-dom'
import { Clock, Users } from 'lucide-react'
import type { Challenge } from '@/types'
import { Badge } from '@/components/ui'

const DIFF_BADGE: Record<string, 'accent' | 'warning' | 'danger'> = {
  Easy: 'accent',
  Medium: 'warning',
  Hard: 'danger',
}

interface ChallengeCardProps {
  challenge: Challenge
}

export default function ChallengeCard({ challenge: c }: ChallengeCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="card-hover flex flex-col overflow-hidden"
      onClick={() => navigate(`/challenges/${c.id}`)}
      style={{ borderRadius: 16 }}
    >
      {/* Accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent flex-shrink-0" />

      <div className="p-5 flex flex-col flex-1">
        {/* Company & Badge */}
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <span className="label-caps">{c.company_name}</span>
          {c.is_sample && <Badge variant="muted" className="text-[9px] flex-shrink-0">Demo</Badge>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[var(--text)] leading-snug mb-3 pr-10 flex-1">
          {c.title}
        </h3>

        {/* Difficulty badge */}
        <div className="mb-3">
          <Badge variant={DIFF_BADGE[c.difficulty] || 'muted'}>{c.difficulty}</Badge>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {c.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-white/4 text-[var(--text-3)]">
              {tag}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-[var(--text-3)] pt-3 border-t border-[var(--border)]">
          <span className="font-semibold text-[var(--text)] text-sm">{c.reward}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Users size={11} />{c.applicant_count}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{c.deadline}</span>
          </div>
        </div>

        {/* Certificate badge */}
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-[rgba(201,160,82,0.1)] mt-2.5">
          <span className="text-sm">🏅</span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--gold)' }}>
            Earn a verified certificate
          </span>
        </div>
      </div>
    </div>
  )
}
