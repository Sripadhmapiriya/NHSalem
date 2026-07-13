import { motion } from 'framer-motion'

/**
 * IconButton — circular icon-only button with aria-label (required)
 */
export default function IconButton({
  icon,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  badge,
  filled = false,
  className = '',
  onClick,
  ...props
}) {
  const sizeMap = {
    sm: { btn: 'w-8 h-8', icon: '18px' },
    md: { btn: 'w-10 h-10', icon: '22px' },
    lg: { btn: 'w-12 h-12', icon: '26px' },
  }
  const { btn, icon: iconSize } = sizeMap[size] || sizeMap.md

  const variants = {
    ghost: 'text-on-surface hover:bg-surface-container',
    navy: 'bg-primary text-on-primary hover:bg-primary-container',
    surface: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
  }

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.90 }}
      aria-label={ariaLabel}
      className={`relative ${btn} rounded-full flex items-center justify-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60 ${variants[variant] || variants.ghost} ${className}`}
      {...props}
    >
      <span
        className={`material-symbols-outlined ${filled ? 'filled' : ''}`}
        style={{ fontSize: iconSize }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {badge != null && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-on-tertiary-container text-on-tertiary text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
          aria-label={`${badge} items`}
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </motion.button>
  )
}
