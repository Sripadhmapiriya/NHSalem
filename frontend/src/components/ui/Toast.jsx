import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import useToastStore from '@/store/toastStore'

/**
 * Toast — slide in from right, auto-dismiss ~3s, stacks vertically
 * Triggered via useToastStore().addToast({ message, type, action })
 */
export function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3500)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const icons = {
    success: { icon: 'check_circle', color: 'text-success' },
    error: { icon: 'error', color: 'text-error' },
    warning: { icon: 'warning', color: 'text-secondary' },
    info: { icon: 'info', color: 'text-primary-container' },
    undo: { icon: 'undo', color: 'text-on-surface-variant' },
  }

  const { icon, color } = icons[toast.type] || icons.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      role="alert"
      aria-live="polite"
      className="flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-[16px] shadow-stat min-w-[280px] max-w-sm"
    >
      <span className={`material-symbols-outlined ${color} flex-shrink-0`} style={{ fontSize: '20px' }} aria-hidden="true">
        {icon}
      </span>
      <p className="text-label-md flex-1">{toast.message}</p>
      {toast.action && (
        <button
          onClick={() => { toast.action.onClick(); onRemove(toast.id) }}
          className="text-secondary-container text-label-md font-semibold hover:opacity-80 flex-shrink-0"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 flex-shrink-0"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">close</span>
      </button>
    </motion.div>
  )
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
