import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Subscription Store — persisted
 */
const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      activeSubscription: null,

      setSubscription: (sub) => set({ activeSubscription: sub }),
      pauseSubscription: () =>
        set((s) => ({
          activeSubscription: s.activeSubscription
            ? { ...s.activeSubscription, status: 'paused' }
            : null,
        })),
      resumeSubscription: () =>
        set((s) => ({
          activeSubscription: s.activeSubscription
            ? { ...s.activeSubscription, status: 'active' }
            : null,
        })),
      cancelSubscription: () => set({ activeSubscription: null }),
    }),
    { name: 'nh-salem-subscription' }
  )
)

export default useSubscriptionStore
