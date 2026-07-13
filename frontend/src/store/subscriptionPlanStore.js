import { create } from 'zustand'
import SUBSCRIPTION_PLANS from '@/mock/subscriptions'

/**
 * Subscription Plan Store — in-memory state.
 * Initialised from static SUBSCRIPTION_PLANS mock array.
 */
const useSubscriptionPlanStore = create((set, get) => ({
  plans: [...SUBSCRIPTION_PLANS],

  /** Add a new plan */
  addPlan: (data) => {
    const newPlan = {
      id: data.id || `plan-${Date.now()}`,
      ...data,
      highlights: data.highlights || [],
      price: Number(data.price),
      isPopular: data.isPopular || false,
    }
    set((state) => ({ plans: [...state.plans, newPlan] }))
    return newPlan
  },

  /** Update an existing plan */
  updatePlan: (id, data) => {
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...data, price: Number(data.price) } : p)),
    }))
  },

  /** Get a specific plan */
  getPlan: (id) => get().plans.find((p) => p.id === id),
}))

export default useSubscriptionPlanStore
