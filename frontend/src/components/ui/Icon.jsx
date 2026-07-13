import { motion } from 'framer-motion'

/**
 * Icon — renders a Material Symbol Outlined icon in a circular background
 * @param {string} name - Material Symbol name (e.g. "search", "shopping_cart")
 * @param {string} size - "sm"|"md"|"lg"|"xl" controls icon size
 * @param {boolean} circle - wrap in circular bg (porthole motif)
 * @param {string} circleColor - Tailwind bg class for circle
 * @param {string} color - Tailwind text color class
 * @param {boolean} filled - filled variant of the icon
 */
export default function Icon({
  name,
  size = 'md',
  circle = false,
  circleColor = 'bg-surface-container',
  color = 'text-on-surface',
  filled = false,
  className = '',
  style = {},
  ...props
}) {
  const sizeMap = {
    xs: { icon: '16px', circle: 'w-7 h-7' },
    sm: { icon: '20px', circle: 'w-9 h-9' },
    md: { icon: '24px', circle: 'w-11 h-11' },
    lg: { icon: '28px', circle: 'w-14 h-14' },
    xl: { icon: '36px', circle: 'w-16 h-16' },
    '2xl': { icon: '48px', circle: 'w-20 h-20' },
  }

  const { icon: iconSize, circle: circleSize } = sizeMap[size] || sizeMap.md

  const iconEl = (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${color} ${className}`}
      style={{ fontSize: iconSize, ...style }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )

  if (circle) {
    return (
      <div
        className={`${circleSize} ${circleColor} rounded-full flex items-center justify-center flex-shrink-0`}
      >
        {iconEl}
      </div>
    )
  }

  return iconEl
}
