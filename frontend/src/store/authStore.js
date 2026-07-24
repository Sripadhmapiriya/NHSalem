import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCartStore } from './cartStore'

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
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setUser: (user, token) => {
        // Clear the previous user's cart from localStorage whenever a new session begins.
        // This prevents one user's cart from leaking into another user's session.
        try {
          localStorage.removeItem('nh-salem-cart-v2')
          localStorage.removeItem('nh-salem-cart') // legacy cleanup
          useCartStore.getState().clearCart() // clear in-memory state
        } catch (_) {}
        set({ user, token })
      },

      logout: () => {
        // Clear cart on logout so the next user (or guest) starts with an empty basket.
        try {
          localStorage.removeItem('nh-salem-cart-v2')
          localStorage.removeItem('nh-salem-cart') // legacy cleanup
          useCartStore.getState().clearCart() // clear in-memory state
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)

export default useAuthStore
