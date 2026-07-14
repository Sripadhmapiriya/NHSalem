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

      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
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
