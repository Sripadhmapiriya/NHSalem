import { create } from 'zustand'
import { getWishlist, toggleWishlistApi } from '@/services/api'

/**
 * Wishlist Store — Synced with backend for authenticated users.
 * Guest users cannot wishlist items (they are prompted to log in).
 */
const useWishlistStore = create((set, get) => ({
  ids: [],
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true })
    try {
      const res = await getWishlist()
      if (res.success) {
        set({
          items: res.items,
          ids: res.items.map(item => item.id)
        })
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error)
    } finally {
      set({ isLoading: false })
    }
  },

  toggle: async (productId) => {
    // Optimistic UI update
    const isCurrentlyWishlisted = get().ids.includes(productId)
    
    set((state) => ({
      ids: isCurrentlyWishlisted
        ? state.ids.filter((id) => id !== productId)
        : [...state.ids, productId],
      // We also optimistically filter out the full item if removing, 
      // but if adding we don't have the full item data yet, so the page might need a refetch later
      items: isCurrentlyWishlisted
        ? state.items.filter((item) => item.id !== productId)
        : state.items
    }))

    // Backend sync
    try {
      const res = await toggleWishlistApi(productId)
      if (!res.success) {
        throw new Error('API failed')
      }
      
      // If we added an item, we need to fetch the full product details so it appears in the `items` array
      if (res.action === 'added') {
        get().fetchWishlist()
      }
    } catch (error) {
      console.error('Failed to toggle wishlist item', error)
      // Revert optimistic update
      set((state) => ({
        ids: isCurrentlyWishlisted
          ? [...state.ids, productId]
          : state.ids.filter((id) => id !== productId)
      }))
    }
  },

  isWishlisted: (productId) => get().ids.includes(productId),

  get count() {
    return get().ids.length
  },
  
  clear: () => set({ ids: [], items: [] })
}))

export default useWishlistStore
