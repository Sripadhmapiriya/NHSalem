import { create } from 'zustand'

/**
 * Admin Auth Store — explicitly backed by localStorage
 */
const useAdminAuthStore = create((set, get) => ({
  admin: null,
  token: null,
  isAdminAppReady: false,

  setAdminAppReady: (ready) => set({ isAdminAppReady: ready }),

  setAdmin: (admin, token) => {
    try {
      localStorage.setItem('nh-salem-admin-token', token)
      localStorage.setItem('nh-salem-admin', JSON.stringify(admin))
    } catch (_) {}
    set({ admin, token })
  },
  
  logout: () => {
    try {
      localStorage.removeItem('nh-salem-admin-token')
      localStorage.removeItem('nh-salem-admin')
    } catch (_) {}
    set({ admin: null, token: null })
  },

  get isAdminLoggedIn() {
    return !!get().admin
  },
}))

export default useAdminAuthStore
