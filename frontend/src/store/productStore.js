import { create } from 'zustand'
import PRODUCTS from '@/mock/products'

/**
 * Product Store — in-memory (not persisted to localStorage).
 * Initialised from the static mock PRODUCTS array.
 *
 * In Phase 2: replace addProduct / updateProduct / deleteProduct with
 * real API calls; component code stays the same.
 */
const useProductStore = create((set, get) => ({
  products: [...PRODUCTS],

  /** Add a new product. Returns the created product. */
  addProduct: (data) => {
    const newProduct = {
      ...data,
      id: `product-${Date.now()}`,
      slug: data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      rating: 0,
      reviewCount: 0,
      freshnessScore: data.freshnessScore ?? 90,
      badges: data.badges ?? [],
    }
    set((state) => ({ products: [newProduct, ...state.products] }))
    return newProduct
  },

  /** Update an existing product by id. */
  updateProduct: (id, data) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }))
  },

  /** Delete a product by id. */
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },

  /** Get a single product by id. */
  getProduct: (id) => get().products.find((p) => p.id === id),
}))

export default useProductStore
