import { useEffect } from 'react'
import { PASS_SCORE } from '@/lib/mcqGenerator'

export function useSystemIntegrity() {
  useEffect(() => {
    // Run silently in the background
    const runChecks = async () => {
      // 1. (Payment check now handled through Provo Secure Verification QR modal)

      // 2. Check Guardian Gate Threshold
      if (PASS_SCORE !== 14) {
        console.warn(`%c⚠️ [SYSTEM WARNING] Guardian MCQ threshold breached. Expected 14, found ${PASS_SCORE}.`, 'color: #ef4444; font-weight: bold; background: #222; padding: 2px 4px; border-radius: 4px;')
      } else {
        console.debug('%c✓ Guardian 14/20 gate locked.', 'color: #22c55e; font-weight: bold;')
      }

      // 3. Perplexity API Check
      const perplexityKey = import.meta.env.VITE_PERPLEXITY_API_KEY as string | undefined
      if (!perplexityKey) {
        console.warn('%c⚠️ [SYSTEM WARNING] Perplexity offline (Missing API Key).', 'color: #D4AF37; font-weight: bold; background: #222; padding: 2px 4px; border-radius: 4px;')
      } else {
        try {
          // Ultra-light ping to verify handshake
          const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${perplexityKey}`
            },
            body: JSON.stringify({
              model: 'llama-3-sonar-large-32k-online',
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1
            }),
            signal: AbortSignal.timeout(3000)
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          console.debug('%c✓ Perplexity handshake successful.', 'color: #22c55e; font-weight: bold;')
        } catch (e) {
          console.warn('%c⚠️ [SYSTEM WARNING] Perplexity offline (Handshake failed).', 'color: #D4AF37; font-weight: bold; background: #222; padding: 2px 4px; border-radius: 4px;')
        }
      }
    }
    
    // Slight delay to not compete with high-priority entry animations
    setTimeout(runChecks, 500)
  }, [])
}
