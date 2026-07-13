import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

/**
 * ProgressRing — animated SVG circular progress ring
 * Used in FreshnessScoreCard and OrderTracking
 * Animates stroke-dashoffset on scroll-into-view
 */
export default function ProgressRing({
  value = 85,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = '#fed255',
  trackColor = 'rgba(255,255,255,0.15)',
  label,
  sublabel,
  className = '',
}) {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(value / max, 0), 1)
  const offset = circumference * (1 - pct)

  useEffect(() => {
    if (inView) {
      controls.start({
        strokeDashoffset: offset,
        transition: { duration: 1, ease: 'easeOut' },
      })
    }
  }, [inView, offset, controls])

  return (
    <div ref={ref} className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && (
          <span className="text-2xl font-bold text-white leading-none">{label}</span>
        )}
        {sublabel && (
          <span className="text-[11px] font-medium text-white/70 mt-0.5 leading-tight">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
