import { create } from 'zustand'
import { useCartStore } from './cartStore'

/**
 * Auth Store — token and user data are backed by localStorage explicitly.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  cartLoginPopupOpen: false,
  pendingAction: null,
  isAppReady: false, // Replaces _hasHydrated

  setAppReady: (ready) => set({ isAppReady: ready }),

  setUser: (user, token) => {
    try {
      localStorage.removeItem('nh-salem-cart-v2')
      localStorage.removeItem('nh-salem-cart') 
      useCartStore.getState().clearCart()
      
      // Explicitly persist to localStorage
      localStorage.setItem('nh-salem-token', token)
      localStorage.setItem('nh-salem-user', JSON.stringify(user))
    } catch (_) {}
    set({ user, token })
  },

  logout: () => {
    try {
      localStorage.removeItem('nh-salem-cart-v2')
      localStorage.removeItem('nh-salem-cart') 
      useCartStore.getState().clearCart()
      
      // Explicitly remove from localStorage
      localStorage.removeItem('nh-salem-token')
      localStorage.removeItem('nh-salem-user')
    } catch (_) {}
    set({ user: null, token: null })
  },

  setCartLoginPopupOpen: (isOpen) => set({ cartLoginPopupOpen: isOpen }),
  setPendingAction: (action) => set({ pendingAction: action }),

  get isLoggedIn() {
    return !!get().user
  },
}))

export default useAuthStore
