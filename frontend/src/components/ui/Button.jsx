import { motion } from 'framer-motion'
import Icon from './Icon'

/**
 * Button — Maritime Premium pill button
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * Primary: solid Deep Navy pill, white text, mandatory inset circular arrow icon right
 * Secondary: white pill, 1px Deep Navy border, Deep Navy text
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-150 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

  const sizes = {
    sm: 'px-4 py-2 text-label-md',
    md: 'px-6 py-3 text-label-md',
    lg: 'px-8 py-4 text-body-md font-semibold',
  }

  const variants = {
    primary:
      'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.97]',
    secondary:
      'bg-white text-primary border border-primary hover:bg-surface-container-low active:scale-[0.97]',
    ghost:
      'bg-transparent text-primary hover:bg-surface-container active:scale-[0.97]',
    danger:
      'bg-error text-on-error hover:opacity-90 active:scale-[0.97]',
    gold:
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim active:scale-[0.97]',
  }

  // Primary always gets circular arrow icon unless custom icon passed or variant custom
  const showArrowIcon = variant === 'primary' && !icon && !className.includes('bg-white')

  const variantClass = className.includes('bg-') ? '' : (variants[variant] || variants.primary)

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ filter: variant === 'primary' ? 'brightness(1.15)' : undefined }}
      className={`${base} ${sizes[size] || sizes.md} ${variantClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
              {icon}
            </span>
          )}
          {showArrowIcon && (
            <span
              className="w-6 h-6 bg-on-primary/10 rounded-full flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                arrow_forward
              </span>
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}
