import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'

const GOLD = '#D4AF37'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (txnRef: string) => void
  loading: boolean
}

export default function PaymentVerificationModal({ isOpen, onClose, onSubmit, loading }: Props) {
  const [txnRef, setTxnRef] = useState('')

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={!loading ? onClose : undefined} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(212,175,55,0.3)] z-10"
            style={{ background: '#0a0a0a', border: `1px solid ${GOLD}` }}
          >
            <button onClick={onClose} disabled={loading} className="absolute right-4 top-4 text-[rgba(255,255,255,0.5)] hover:text-white transition-colors">
              <X size={18} />
            </button>

            <h3 className="font-display text-xl font-bold mb-2 text-white">Elite Verification</h3>
            <p className="text-sm mb-5" style={{ color: GOLD }}>Founder-Direct Verification: Scan to finalize your Challenge.</p>

            <div className="bg-white p-2 rounded-xl inline-block mb-5">
              <img src="/paytm-qr.png" alt="Paytm QR Code" className="w-48 h-48 object-cover rounded-lg" />
            </div>

            <div className="text-left mb-5">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Transaction Reference Number
              </label>
              <input 
                type="text" 
                placeholder="e.g. 123456789012"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full bg-black/50 border border-[rgba(212,175,55,0.3)] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                onFocus={e => (e.currentTarget.style.borderColor = GOLD)}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)')}
              />
            </div>

            <button
              onClick={() => onSubmit(txnRef)}
              disabled={loading || !txnRef.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm text-black flex items-center justify-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #F5D77A)` }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle size={16} /> Submit for Verification</>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
