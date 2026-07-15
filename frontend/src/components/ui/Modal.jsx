import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

/**
 * Modal — backdrop fade + panel scale 0.95→1, focus trap, restore on close
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  id,
  noScroll = false,
}) {
  const panelRef = useRef(null)
  const prevFocusRef = useRef(null)

  // Focus trap
  const trapFocus = useCallback((e) => {
    if (!panelRef.current) return
    const focusable = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus()
      }
    }
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      prevFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', trapFocus)
      setTimeout(() => {
        panelRef.current?.querySelector('button, input')?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', trapFocus)
      prevFocusRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', trapFocus)
    }
  }, [isOpen, trapFocus])

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={id ? `${id}-title` : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`relative bg-white rounded-[28px] shadow-stat w-full ${sizeMap[size]} ${noScroll ? '' : 'max-h-[90vh] overflow-y-auto'}`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-6 pb-4">
                {title && (
                  <h2
                    id={id ? `${id}-title` : undefined}
                    className="text-headline-sm font-semibold text-on-surface"
                  >
                    {title}
                  </h2>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors ml-auto"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }} aria-hidden="true">
                      close
                    </span>
                  </button>
                )}
              </div>
            )}
            {/* Content */}
            <div className={title || showClose ? 'px-6 pb-6' : 'p-6'}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
