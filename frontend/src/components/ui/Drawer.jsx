import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

/**
 * Drawer — slides from bottom (mobile) or right (desktop)
 * Used for: mobile filter drawer, cart drawer
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'bottom',
  className = '',
  id,
}) {
  const panelRef = useRef(null)
  const prevFocusRef = useRef(null)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      prevFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const variants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
      className: 'fixed bottom-0 left-0 right-0 rounded-t-[28px] max-h-[85vh]',
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
      className: 'fixed top-0 right-0 bottom-0 w-full max-w-sm',
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
      className: 'fixed top-0 left-0 bottom-0 w-full max-w-sm',
    },
  }

  const v = variants[side] || variants.bottom

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby={id ? `${id}-title` : undefined}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={v.initial}
            animate={v.animate}
            exit={v.exit}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={`absolute bg-white shadow-stat overflow-y-auto ${v.className} ${className}`}
          >
            {/* Handle (bottom drawer) */}
            {side === 'bottom' && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-outline-variant" aria-hidden="true" />
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              {title && (
                <h2 id={id ? `${id}-title` : undefined} className="text-headline-sm font-semibold text-on-surface">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors ml-auto"
              >
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }} aria-hidden="true">
                  close
                </span>
              </button>
            </div>
            {/* Content */}
            <div className="px-6 pb-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
