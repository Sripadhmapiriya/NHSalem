import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Wishlist Store — persisted to localStorage
 */
const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        }))
      },

      isWishlisted: (productId) => get().ids.includes(productId),

      get count() {
        return get().ids.length
      },
    }),
    {
      name: 'nh-salem-wishlist',
    }
  )
)

export default useWishlistStore
