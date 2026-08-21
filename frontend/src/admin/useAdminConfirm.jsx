import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminBtn } from '@/admin/AdminUI'

export function useAdminConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    resolve: null,
  })

  const confirm = useCallback(({ title, message }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }, [confirmState])

  const ConfirmModal = () => (
    <AnimatePresence>
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-admin-navy/40 backdrop-blur-[2px]"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[20px] shadow-[0_12px_40px_rgba(11,30,61,0.15)] overflow-hidden border border-admin-border/50"
          >
            {/* Header pattern */}
            <div className="h-2 w-full bg-[url('/admin-pattern.svg')] opacity-50"></div>
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-admin-seafoam flex items-center justify-center text-admin-navy">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>info</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-admin-navy mb-1.5">{confirmState.title || 'Please Confirm'}</h3>
                  <p className="text-[13px] text-admin-text-sub leading-relaxed whitespace-pre-line">
                    {confirmState.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <AdminBtn variant="secondary" onClick={handleCancel}>
                  Cancel
                </AdminBtn>
                <AdminBtn variant="primary" onClick={handleConfirm}>
                  Confirm
                </AdminBtn>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return { confirm, ConfirmModal }
}
