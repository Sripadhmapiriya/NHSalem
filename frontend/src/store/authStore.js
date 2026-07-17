import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth Store — persisted to localStorage
 * user: { id, name, phone, email } | null
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      cartLoginPopupOpen: false,
      pendingAction: null,

      setUser: (user, token) => {
        // Clear the previous user's cart from localStorage whenever a new session begins.
        // This prevents one user's cart from leaking into another user's session.
        try {
          localStorage.removeItem('nh-salem-cart')
        } catch (_) {}
        set({ user, token })
      },

      logout: () => {
        // Clear cart on logout so the next user (or guest) starts with an empty basket.
        try {
          localStorage.removeItem('nh-salem-cart')
        } catch (_) {}
        set({ user: null, token: null })
      },

      setCartLoginPopupOpen: (isOpen) => set({ cartLoginPopupOpen: isOpen }),
      setPendingAction: (action) => set({ pendingAction: action }),

      get isLoggedIn() {
        return !!useAuthStore.getState().user
      },
    }),
    {
      name: 'nh-salem-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
