import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import './CinematicGreeting.css'

export function CinematicGreeting() {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] || 'Founder'
  
  const greeting = getGreeting()
  const timeOfDay = greeting.replace('Good ', '').toLowerCase()

  return (
    <div className="mb-4 relative inline-block">
      {/* 1. Greeting Fades In First */}
      <motion.div
        initial={{ opacity: 0, y: 5, filter: 'blur(4px)' }}
        animate={{ opacity: 0.7, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        className="text-xl md:text-2xl font-medium mb-1" 
        style={{ color: '#ffffff' }}
      >
        Good {timeOfDay},
      </motion.div>

      {/* 2. The Gold Shimmer Name Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
        className="text-5xl md:text-6xl font-display font-bold relative"
      >
        <span className="shimmer-text">
          {firstName}.
        </span>
      </motion.div>
    </div>
  )
}
