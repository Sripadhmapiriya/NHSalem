import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { ProgressStepper } from '@/components/ui/Stepper'
import useToastStore from '@/store/toastStore'
import useSubscriptionStore from '@/store/subscriptionStore'
import { getSubscriptionPlans, createSubscription } from '@/services/api'
import { MOCK_SUBSCRIPTION } from '@/mock/subscriptions'

const SUBSCRIPTION_STEPS = [
  { icon: 'anchor', title: 'Sustainable Catch', desc: 'Hand-selected from certified sustainable fishing partners' },
  { icon: 'verified', title: 'Maritime Grade Prep', desc: 'Cleaned, cut, and vacuum-packed to your preferences' },
  { icon: 'local_shipping', title: 'Cold-Chain Delivery', desc: 'Delivered fresh on your chosen day, every week' },
]

export default function Subscriptions() {
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const { addToast } = useToastStore()
  const { activeSubscription, setSubscription, pauseSubscription, resumeSubscription, cancelSubscription } = useSubscriptionStore()

  useEffect(() => {
    getSubscriptionPlans().then(setPlans)
  }, [])

  const handleSubscribe = async () => {
    if (!selectedPlan) return
    setSubscribing(true)
    const result = await createSubscription({ planId: selectedPlan })
    if (result.success) {
      const plan = plans.find((p) => p.id === selectedPlan)
      setSubscription({ ...MOCK_SUBSCRIPTION, planId: selectedPlan, planName: plan?.name, status: 'active' })
      addToast({ message: `🎉 Subscribed to ${plan?.name}! Your first box ships soon.`, type: 'success', duration: 5000 })
      setSelectedPlan(null)
    }
    setSubscribing(false)
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-primary text-white text-center" aria-labelledby="subscriptions-heading">
        <div className="container-max">
          <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">
            Curated Weekly Boxes
          </p>
          <h1 id="subscriptions-heading" className="text-display-lg-mobile md:text-display-lg mb-4">
            Curated Sea-to-Table Subscriptions
          </h1>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto">
            Fresh seafood on your schedule. Choose your plan, customize your catch, pause or cancel anytime.
          </p>
        </div>
      </section>

      {/* Active Subscription Management */}
      {activeSubscription && (
        <section className="py-8 bg-success/5 border-b border-success/20" aria-labelledby="active-sub-heading">
          <div className="container-max">
            <div className="bg-white rounded-[28px] shadow-card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 id="active-sub-heading" className="text-headline-sm text-on-surface">
                      Monthly Mariner's Box
                    </h2>
                    <span className={`px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                      activeSubscription.status === 'active' ? 'bg-success/10 text-success' : 'bg-outline/10 text-outline'
                    }`}>
                      {activeSubscription.status === 'active' ? '● Active' : '⏸ Paused'}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-3">
                    Next delivery: <strong className="text-on-surface">{activeSubscription.nextDelivery}</strong> at <strong>{activeSubscription.deliverySlot}</strong>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSubscription.itemsThisWeek?.map((item) => (
                      <span key={item} className="px-3 py-1 bg-surface-container rounded-full text-label-sm text-on-surface">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {activeSubscription.status === 'active' ? (
                    <Button variant="secondary" size="sm" onClick={() => { pauseSubscription(); addToast({ message: 'Subscription paused', type: 'info' }) }}>
                      Pause
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => { resumeSubscription(); addToast({ message: 'Subscription resumed! 🎉', type: 'success' }) }}>
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel your subscription?')) {
                        cancelSubscription()
                        addToast({ message: 'Subscription cancelled', type: 'info' })
                      }
                    }}
                    className="text-error hover:bg-error-container"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Plans */}
      <section className="py-16" aria-labelledby="plans-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="plans-heading" className="text-display-lg-mobile text-on-surface mb-3">Choose Your Plan</h2>
            <p className="text-body-lg text-on-surface-variant">All plans include free delivery and a 100% freshness guarantee.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                className={`relative bg-white rounded-[28px] shadow-card p-6 cursor-pointer border-2 transition-all ${
                  selectedPlan === plan.id
                    ? 'border-primary shadow-stat'
                    : plan.isPopular
                      ? 'border-secondary-container'
                      : 'border-transparent hover:border-outline-variant'
                }`}
                role="radio"
                aria-checked={selectedPlan === plan.id}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1 rounded-full text-label-sm font-bold ${
                      plan.isPopular ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary text-on-primary'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4 mt-2">
                  <h3 className="text-headline-sm text-on-surface mb-0.5">{plan.name}</h3>
                  <p className="text-label-md text-on-surface-variant">{plan.tagline}</p>
                </div>

                <div className="mb-5">
                  <p className="text-4xl font-black text-on-surface">
                    ₹{plan.price.toLocaleString()}
                    <span className="text-label-md font-normal text-on-surface-variant ml-1">/{plan.period}</span>
                  </p>
                  <p className="text-label-md text-success font-semibold">Save {plan.savings}</p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-success filled flex-shrink-0" style={{ fontSize: '18px' }} aria-hidden="true">check_circle</span>
                      {h}
                    </li>
                  ))}
                </ul>

                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary filled" style={{ fontSize: '14px' }} aria-hidden="true">check</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <Button
                variant="primary"
                size="lg"
                loading={subscribing}
                onClick={handleSubscribe}
              >
                Subscribe to {plans.find((p) => p.id === selectedPlan)?.name}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* The NH Salem Journey */}
      <section className="py-16 bg-primary text-white" aria-labelledby="journey-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="journey-heading" className="text-display-lg-mobile">The NH Salem Journey</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {SUBSCRIPTION_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-secondary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '28px' }} aria-hidden="true">{step.icon}</span>
                </div>
                <h3 className="text-headline-sm text-white mb-2">{step.title}</h3>
                <p className="text-body-md text-white/70">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
