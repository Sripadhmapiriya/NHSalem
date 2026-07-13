import { motion } from 'framer-motion'

/**
 * Chip / FilterPill — pill-shaped selectable chip
 * variant: "filter" | "weight" | "category" | "status"
 */
export default function Chip({
  children,
  selected = false,
  onClick,
  variant = 'filter',
  icon,
  removable = false,
  onRemove,
  disabled = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md transition-all duration-150 cursor-pointer select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'

  const variants = {
    filter: selected
      ? 'bg-primary text-on-primary border-primary'
      : 'bg-white text-on-surface border-outline-variant hover:border-primary hover:text-primary',
    weight: selected
      ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
      : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-secondary',
    category: selected
      ? 'bg-primary text-on-primary border-primary'
      : 'bg-surface-container text-on-surface border-transparent hover:bg-surface-container-high',
    status: 'bg-success/10 text-success border-success/20 cursor-default',
  }

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`${base} ${variants[variant] || variants.filter} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 -mr-1"
          aria-label="Remove filter"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">
            close
          </span>
        </button>
      )}
    </motion.button>
  )
}
