import { create } from 'zustand'

let idCounter = 0

/**
 * Toast Store — in-memory (not persisted)
 * addToast({ message, type, duration, action })
 * type: "success" | "error" | "warning" | "info" | "undo"
 * action: { label, onClick }
 */
const useToastStore = create((set) => ({
  toasts: [],

  addToast: ({ message, type = 'info', duration = 3500, action }) => {
    const id = `toast-${++idCounter}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration, action }],
    }))
    return id
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  clearAll: () => set({ toasts: [] }),
}))

export default useToastStore
