import { create } from 'zustand'
import { getProducts } from '@/services/api'
import { createAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/services/adminApi'

/**
 * Product Store — dynamically synced with backend API.
 */
const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  /** Fetch products from the backend */
  fetchProducts: async () => {
    set({ loading: true })
    try {
      const data = await getProducts()
      set({ products: data, loading: false })
    } catch (err) {
      console.error('Failed to fetch products:', err)
      set({ loading: false })
    }
  },

  /** Add a new product. Returns the created product. */
  addProduct: async (data) => {
    const newProduct = await createAdminProduct(data)
    set((state) => ({ products: [newProduct, ...state.products] }))
    return newProduct
  },

  /** Update an existing product by id. */
  updateProduct: async (id, data) => {
    const updated = await updateAdminProduct(id, data)
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p))
    }))
  },

  /** Delete a product by id. */
  deleteProduct: async (id) => {
    await deleteAdminProduct(id)
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }))
  },

  /** Get a single product by id. */
  getProduct: (id) => get().products.find((p) => p.id === id || p.slug === id)
}))

export default useProductStore
