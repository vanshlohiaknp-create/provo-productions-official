import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { PricingPlan, PaymentResult, PaymentStatus } from '@/types'

export function usePayment() {
  const { user, updateUser } = useAuth()
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [result, setResult] = useState<PaymentResult | null>(null)
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    plan: PricingPlan | null
    resolve: ((res: PaymentResult) => void) | null
  }>({ isOpen: false, plan: null, resolve: null })

  const checkout = useCallback(async (plan: PricingPlan): Promise<PaymentResult> => {
    if (plan.paymentAmount === 0) {
      const res: PaymentResult = { status: 'success', planName: plan.name, message: 'Free plan activated!' }
      setResult(res)
      setStatus('success')
      return res
    }
    
    return new Promise((resolve) => {
      setModalState({ isOpen: true, plan, resolve })
    })
  }, [])

  const submitVerification = useCallback(async (txnRef: string) => {
    if (!txnRef.trim()) {
      alert("Please enter a valid Transaction Reference Number.")
      return
    }
    
    setStatus('loading')
    
    // Simulate API call / Supabase insert
    try {
      const { error } = await supabase.from('payment_verification').insert({
        business_id: user?.id,
        txn_ref: txnRef,
        plan_id: modalState.plan?.id,
      })

      if (error) {
        console.error("Supabase Error:", error)
        alert("Failed to submit verification. Please try again.")
        setStatus('idle')
        return
      }
    } catch (e) {
      console.error(e)
      alert("Error submitting verification.")
      setStatus('idle')
      return
    }

    await new Promise(r => setTimeout(r, 1200))

    const res: PaymentResult = { 
      status: 'success', 
      planName: modalState.plan?.name || 'Upgrade',
      message: 'Status: Pending Verification',
      orderId: txnRef
    }
    
    setResult(res)
    setStatus('success')
    
    // Automate State Mutation
    updateUser({ tier: 'Prestige Tier' })
    
    if (modalState.resolve) modalState.resolve(res)
    setModalState({ isOpen: false, plan: null, resolve: null })
  }, [user, updateUser, modalState])

  const closeQRModal = useCallback(() => {
    const res: PaymentResult = { status: 'idle', message: 'Payment cancelled.' }
    if (modalState.resolve) modalState.resolve(res)
    setModalState({ isOpen: false, plan: null, resolve: null })
  }, [modalState])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
  }, [])

  return { 
    checkout, 
    status, 
    result, 
    reset, 
    loading: status === 'loading',
    qrModalProps: {
      isOpen: modalState.isOpen,
      onClose: closeQRModal,
      onSubmit: submitVerification,
      selectedPlan: modalState.plan,
    }
  }
}
