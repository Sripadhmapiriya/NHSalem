import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mediaQuery.matches)
    const listener = (e) => setReduced(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])
  return reduced
}

const FishIcon = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12c3-4.5 8-5.5 12.5-3.5c1.5-.7 3.5-.8 4.5-.4c-.2 1.5-.4 3-.8 4.4c2.5 3.5-1.5 6.5-5.5 5c-4.5 1.5-8.5.5-10.7-5.5z" />
    <circle cx="15.5" cy="10.5" r="1" fill="currentColor" />
    <path d="M6.5 11c.8 1.2 1.6 1.2 2.4 0" />
  </svg>
)

const ShrimpIcon = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4a6.5 6.5 0 0 1 6.5 6.5c0 1.8-.9 3.2-2.3 4.1" />
    <path d="M15.2 13.7C14.3 14.6 13 15 11.7 15C9 15 6.8 12.8 6.8 10c0-.9.4-1.8 1-2.5" />
    <path d="M6 5.8c-.4.4-.7 1-.7 1.7" />
    <path d="M11.7 15c-.7 1.1-1.8 1.8-2.9 1.8s-1.1-.7-.7-1.5" />
    <path d="M18.5 9.5c.8-.4 1.8-.8 1.8-1.8M18.5 9.5c.8 0 1.8.4 1.8 1.3" />
  </svg>
)

const CrabIcon = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 7c-3.2 0-5.5 1.8-5.5 4.5s2.2 4.5 5.5 4.5s5.5-1.8 5.5-4.5S15.2 7 12 7z" />
    <path d="M6.5 9C5.8 7.6 4.6 7 3.5 7.6c0 0 .9 2.3 2.9 2.8" />
    <path d="M17.5 9c.7-1.4 1.9-2 3-1.4 0 0-.9 2.3-2.9 2.8" />
    <path d="M4.6 13.5c-.7.3-1.4 1.1-1.4 2.2" />
    <path d="M4.6 15.2c-.3.7-.7 1.4-.7 2.2" />
    <path d="M19.4 13.5c.7.3 1.4 1.1 1.4 2.2" />
    <path d="M19.4 15.2c.3.7.7 1.4.7 2.2" />
  </svg>
)

export default function SeafoodLoader({ text = 'Fetching the freshest catch…', className = '' }) {
  const reducedMotion = usePrefersReducedMotion()

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const iconVariants = {
    animate: {
      y: reducedMotion ? [0, 0] : [-8, 8],
      transition: {
        y: {
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }
      }
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`} role="status" aria-label="Loading content">
      <motion.div 
        variants={containerVariants}
        animate="animate"
        className="flex items-center gap-6 mb-5 text-primary"
      >
        <motion.div variants={iconVariants}>
          <FishIcon className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.div variants={iconVariants}>
          <ShrimpIcon className="w-10 h-10 text-secondary" style={{ color: 'var(--on-secondary-container)' }} />
        </motion.div>
        <motion.div variants={iconVariants}>
          <CrabIcon className="w-10 h-10 text-primary" />
        </motion.div>
      </motion.div>
      {text && (
        <motion.p
          animate={reducedMotion ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={reducedMotion ? {} : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-label-sm font-extrabold text-on-surface-variant tracking-[0.18em] uppercase text-center max-w-xs"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
