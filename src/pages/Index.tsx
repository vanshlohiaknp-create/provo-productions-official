import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button, Badge } from '@/components/ui'
import { PRICING_PLANS } from '@/data/sampleData'
import { usePayment } from '@/hooks/usePayment'
import PaymentVerificationModal from '@/components/ui/PaymentVerificationModal'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function Index() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { checkout, loading, result, status, qrModalProps } = usePayment()
  const [payingPlan, setPayingPlan] = useState<string | null>(null)

  const handlePricingClick = async (plan: typeof PRICING_PLANS[0]) => {
    if (!isAuthenticated) { navigate('/signup'); return }
    if (plan.razorpayAmount === 0) { navigate('/signup'); return }
    setPayingPlan(plan.id)
    await checkout(plan)
    setPayingPlan(null)
  }

  const features = [
    { icon: '🎯', title: 'Challenge Engine', desc: 'Real-world problems posted by businesses and faculty. Students solve them and earn verified proof.' },
    { icon: '🏆', title: 'Proof Profile', desc: 'Every solved challenge builds a verified, LinkedIn-ready portfolio with ratings and Provo Score.' },
    { icon: '📝', title: 'MCQ Mode', desc: 'Timed assessments with instant scoring, weak-area analysis, and competitive ranking.' },
    { icon: '📊', title: 'Business Analytics', desc: 'Track challenge engagement, submission quality, and find top performers with real-time dashboards.' },
    { icon: '🚀', title: 'Leaderboard', desc: 'Transparent weekly and monthly rankings surface the most skilled students to recruiters.' },
    { icon: '🔒', title: 'Verified Certificates', desc: 'Company-stamped, tamper-proof certificates auto-generated on acceptance or win.' },
  ]

  const howItWorks = [
    { step: '1', title: 'Business Posts Challenge', desc: 'A real-world problem with deadline, reward, and clear success criteria.' },
    { step: '2', title: 'Student Solves It', desc: 'Students submit solutions as PDF or PPT. Quality is the only currency.' },
    { step: '3', title: 'Proof Gets Certified', desc: 'Winners earn verified certificates and Provo Score. Hiring happens based on proof.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Backgrounds */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 50%, rgba(79,126,248,0.07) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="page-container relative z-10 py-24 md:py-32">
          <div className="max-w-[680px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(79,126,248,0.25)] bg-[rgba(79,126,248,0.08)] mb-7 animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
              <span className="label-caps" style={{ color: 'var(--primary)' }}>Proof-Based Hiring Platform · Early Access</span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up delay-100"
              style={{ fontSize: 'clamp(44px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 22 }}>
              Hire Based on<br />
              <span className="grad-text italic">Real Work.</span><br />
              Not Résumés.
            </h1>

            <p className="animate-fade-up delay-200 mb-8" style={{ fontSize: 17, maxWidth: 480, lineHeight: 1.75 }}>
              Provo connects students, faculties, and businesses through real challenges and proof-based outcomes.
            </p>

            <div className="flex gap-3 flex-wrap animate-fade-up delay-300">
              <Button variant="primary" size="lg" onClick={() => navigate('/signup')}>
                Get Started →
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/challenges')}>
                Explore Challenges
              </Button>
            </div>

            {/* Early access note */}
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-white/[0.025] animate-fade-up delay-400">
              <span className="text-xl">🚀</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Early Access Platform</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Be among the first — shaping the future of hiring in India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section-padding" style={{ background: 'var(--bg-2)' }}>
        <div className="page-container">
          <div className="mb-12">
            <p className="label-caps mb-3">Platform</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700, maxWidth: 480 }}>
              Everything you need to <span className="grad-text italic">win.</span>
            </h2>
            <p className="mt-3 text-sm" style={{ maxWidth: 420 }}>A complete ecosystem for campus innovation and talent discovery.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card-hover p-7" style={{ borderRadius: 16 }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f7ef8] to-[#7c55f0] flex items-center justify-center text-xl mb-4 shadow-[0_0_20px_-4px_rgba(79,126,248,0.4)]">
                  {f.icon}
                </div>
                <h4 className="font-semibold mb-2 text-sm">{f.title}</h4>
                <p className="text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-padding">
        <div className="page-container">
          <div className="mb-12">
            <p className="label-caps mb-3">Process</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>
              How <span className="grad-text italic">Provo works.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {howItWorks.map(step => (
              <div key={step.step} className="card-base p-7 relative" style={{ borderRadius: 16 }}>
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-[#4f7ef8] to-[#7c55f0]" />
                <div className="w-8 h-8 rounded-full bg-[var(--primary-dim)] border border-[rgba(79,126,248,0.2)] flex items-center justify-center text-sm font-bold text-[var(--primary)] mb-5">
                  {step.step}
                </div>
                <h4 className="font-semibold mb-2 text-sm">{step.title}</h4>
                <p className="text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="section-padding" id="pricing" style={{ background: 'var(--bg-2)' }}>
        <div className="page-container">
          <div className="mb-12">
            <p className="label-caps mb-3">Pricing</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 700 }}>
              Simple, transparent <span className="grad-text italic">pricing.</span>
            </h2>
            <p className="mt-3 text-sm">For businesses ready to access top campus talent.</p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <Badge variant="accent">🚀 Early access pricing</Badge>
              <span className="label-caps">Cancel anytime · No hidden fees</span>
            </div>
            <div className="mt-3 px-3 py-2 rounded-lg border border-[var(--border)] bg-white/[0.02] inline-flex items-center gap-2">
              <span className="text-sm">🔒</span>
              <span className="text-xs text-[var(--text-3)]">Demo Mode — No real money charged during preview</span>
            </div>
          </div>

          {/* Payment result notification */}
          {status === 'success' && result && (
            <div className="mb-8 p-4 rounded-xl border border-[rgba(15,184,120,0.3)] bg-[var(--accent-dim)] flex items-center gap-3">
              <span className="text-xl">🎉</span>
              <div>
                <p className="text-sm font-semibold text-[var(--accent)]">{result.message}</p>
                {result.orderId && <p className="text-xs text-[var(--text-3)] mt-0.5">Order ID: {result.orderId}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[940px] items-start">
            {PRICING_PLANS.map(plan => (
              <div
                key={plan.id}
                className={plan.featured ? 'rounded-xl p-7 flex flex-col relative md:scale-[1.03]' : 'card-base p-7 flex flex-col relative'}
                style={plan.featured ? {
                  background: 'linear-gradient(135deg, #4f7ef8, #7c55f0)',
                  borderRadius: 16,
                  boxShadow: '0 0 60px -12px rgba(79,126,248,0.4)',
                } : {}}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent)] text-black">
                    Most Popular
                  </span>
                )}
                <p className="label-caps mb-2" style={plan.featured ? { color: 'rgba(255,255,255,0.55)' } : {}}>
                  {plan.name}
                </p>
                <p className="text-sm mb-4" style={plan.featured ? { color: 'rgba(255,255,255,0.7)' } : {}}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="font-display text-[44px] font-extrabold leading-none" style={{ color: plan.featured ? '#fff' : 'var(--text)' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.featured ? 'rgba(255,255,255,0.55)' : 'var(--text-2)' }}>
                    {plan.period}
                  </span>
                </div>
                <ul className="flex-1 space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: plan.featured ? 'rgba(255,255,255,0.85)' : 'var(--text-2)' }}>
                      <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.featured ? '#fff' : 'var(--accent)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${plan.featured ? 'bg-white/15 text-white border border-white/25 hover:bg-white/20' : 'bg-transparent border border-[var(--border)] text-[var(--text)] hover:border-[var(--border-hover)] hover:bg-[var(--primary-dim)]'}`}
                  onClick={() => handlePricingClick(plan)}
                  disabled={payingPlan === plan.id && loading}
                >
                  {payingPlan === plan.id && loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin-slow" />
                      Processing…
                    </span>
                  ) : (
                    plan.razorpayAmount === 0 ? 'Get Started' : `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
      <PaymentVerificationModal {...qrModalProps} />
    </div>
  )
}

