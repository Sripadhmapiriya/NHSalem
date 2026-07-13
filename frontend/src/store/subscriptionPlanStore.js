import { create } from 'zustand'
import { getSubscriptionPlans } from '@/services/api'
import { createAdminPlan, updateAdminPlan, deleteAdminPlan } from '@/services/adminApi'

/**
 * Subscription Plan Store — dynamically synced with backend API.
 */
const useSubscriptionPlanStore = create((set, get) => ({
  plans: [],
  loading: false,

  /** Fetch plans from the backend */
  fetchPlans: async () => {
    set({ loading: true })
    try {
      const data = await getSubscriptionPlans()
      set({ plans: data, loading: false })
    } catch (err) {
      console.error('Failed to fetch subscription plans:', err)
      set({ loading: false })
    }
  },

  /** Add a new plan */
  addPlan: async (data) => {
    const newPlan = await createAdminPlan(data)
    set((state) => ({ plans: [...state.plans, newPlan] }))
    return newPlan
  },

  /** Update an existing plan */
  updatePlan: async (id, data) => {
    const updated = await updateAdminPlan(id, data)
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? updated : p)),
    }))
  },

  /** Delete an existing plan */
  deletePlan: async (id) => {
    await deleteAdminPlan(id)
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id)
    }))
  },

  /** Get a specific plan */
  getPlan: (id) => get().plans.find((p) => p.id === id || p.slug === id),
}))

export default useSubscriptionPlanStore
