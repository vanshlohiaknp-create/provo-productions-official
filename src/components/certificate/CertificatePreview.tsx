import { Download, Share2, Copy } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Certificate } from '@/types'
import { formatDate } from '@/lib/utils'

interface CertificatePreviewProps {
  certificate?: Partial<Certificate>
  studentName?: string
  challengeTitle?: string
  companyName?: string
  /** If true, show only a compact preview card */
  compact?: boolean
  onDownload?: () => void
  onShare?: () => void
}

export default function CertificatePreview({
  certificate,
  studentName,
  challengeTitle,
  companyName,
  compact,
  onDownload,
  onShare,
}: CertificatePreviewProps) {
  const name = certificate?.student_name || studentName || 'Your Name'
  const title = certificate?.challenge_title || challengeTitle || 'Challenge Title'
  const company = certificate?.company_name || companyName || 'Company'
  const code = certificate?.certificate_code || 'PROVO-XXXX-XXXX'
  const date = certificate?.issued_at ? formatDate(certificate.issued_at) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const skills = certificate?.skills || []

  if (compact) {
    return (
      <div className="rounded-xl overflow-hidden border border-[rgba(201,160,82,0.2)]">
        <div className="cert-bar" />
        <div className="bg-[#08060e] p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#c9a052] to-[#e8c97a] flex items-center justify-center text-[10px] font-bold text-black font-display">P</div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: 'var(--gold)' }}>Provo</span>
          </div>
          <p className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-2">Certificate of Achievement</p>
          <p className="font-display italic text-lg font-semibold" style={{ color: 'var(--gold)' }}>{name}</p>
          <p className="text-xs text-white/50 mt-1 line-clamp-2">"{title}"</p>
        </div>
        <div className="cert-bar" />
      </div>
    )
  }

  return (
    <div id="certificate-print">
      {/* Certificate card */}
      <div className="rounded-2xl overflow-hidden shadow-[0_8px_80px_-12px_rgba(201,160,82,0.3)]">
        <div className="cert-bar" />
        <div className="bg-[#06060e] px-14 py-12 text-center relative overflow-hidden md:px-14 px-6">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,160,82,0.05) 0%, transparent 70%)',
          }} />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#c9a052] to-[#e8c97a] flex items-center justify-center font-display font-bold text-black text-[13px]">P</div>
              <span className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: 'var(--gold)' }}>Provo</span>
            </div>

            <h1 className="font-display text-[clamp(26px,4vw,40px)] font-bold text-white mb-1">
              Certificate of Achievement
            </h1>
            <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: 'rgba(201,160,82,0.5)' }}>
              Proof-of-Work Verification
            </p>

            <div className="w-14 h-px mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,160,82,0.4), transparent)' }} />

            <p className="text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              This certificate is awarded to
            </p>
            <p className="font-display text-[clamp(24px,4vw,38px)] font-semibold italic mb-5" style={{ color: 'var(--gold)' }}>
              {name}
            </p>

            <p className="text-sm text-white/60 leading-relaxed max-w-md mx-auto mb-5">
              For successfully solving{' '}
              <strong className="text-white">"{title}"</strong>
            </p>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {skills.map(skill => (
                  <span key={skill} className="px-3 py-1 text-[11px] rounded-full border font-medium" style={{ borderColor: 'rgba(201,160,82,0.25)', color: 'var(--gold)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-5 border-t" style={{ borderColor: 'rgba(201,160,82,0.1)' }}>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Issued By</p>
                <p className="text-sm font-medium text-white/80">{company}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Date</p>
                <p className="text-sm font-medium text-white/80">{date}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>ID</p>
                <p className="text-[11px] font-mono font-medium" style={{ color: 'var(--gold)' }}>{code}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="cert-bar" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5 flex-wrap">
        <Button
          variant="primary"
          className="flex-1 min-w-[140px]"
          onClick={onDownload}
        >
          <Download size={15} /> Download PDF
        </Button>
        <Button
          variant="outline"
          className="flex-1 min-w-[140px]"
          onClick={onShare || (() => {
            const url = `${window.location.origin}/certificate/${code}`
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
          })}
        >
          <Share2 size={15} /> Share on LinkedIn
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/certificate/${code}`)
          }}
          title="Copy verification link"
        >
          <Copy size={15} />
        </Button>
      </div>
    </div>
  )
}
