import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart Store — persisted to localStorage
 * CartItem: { id, name, image, weight, price, quantity }
 * Key: `${id}::${weight}` for multiple weight variants
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (item) => {
        set((state) => {
          const key = `${item.id}::${item.weight}`
          const existing = state.items.find((i) => `${i.id}::${i.weight}` === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                `${i.id}::${i.weight}` === key
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] }
        })
      },

      removeItem: (id, weight) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.weight === weight)),
        }))
      },

      updateQuantity: (id, weight, quantity) => {
        if (quantity < 1) {
          get().removeItem(id, weight)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.weight === weight ? { ...i, quantity } : i
          ),
        }))
      },

      getItem: (id, weight) => {
        return get().items.find((i) => i.id === id && i.weight === weight) || null
      },

      clearCart: () => set({ items: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'nh-salem-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
)

/**
 * useCart — hook with reactive computed totals
 */
export default function useCart() {
  const store = useCartStore()
  const totalItems = store.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = store.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = store.coupon?.discount || 0
  const total = Math.max(0, subtotal - discount)
  return { ...store, totalItems, subtotal, discount, total }
}
