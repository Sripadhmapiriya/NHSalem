import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Admin Auth Store — persisted to localStorage under 'nh-salem-admin-auth'.
 * Kept completely separate from useAuthStore ('nh-salem-auth') so an admin
 * and a customer can be simultaneously logged in on the same browser.
 *
 * admin: { id, name, email, role } | null
 * token: string | null
 */
const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAdmin: (admin, token) => set({ admin, token }),
      logout: () => set({ admin: null, token: null }),

      get isAdminLoggedIn() {
        return !!get().admin
      },
    }),
    {
      name: 'nh-salem-admin-auth',
      partialize: (state) => ({ admin: state.admin, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

export default useAdminAuthStore
