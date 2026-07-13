import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FreshnessScoreCard from '@/components/ui/FreshnessScoreCard'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { getOrderStatus } from '@/services/api'

export default function OrderTracking() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getOrderStatus(orderId).then((data) => {
      setOrder(data)
      setLoading(false)
    })
  }, [orderId])

  if (loading) return <PageSkeleton />
  if (!order) return (
    <div className="container-max py-32 text-center">
      <h1 className="text-display-lg-mobile text-on-surface mb-4">Order Not Found</h1>
      <p className="text-body-lg text-on-surface-variant mb-8">Order ID: {orderId}</p>
      <Link to="/" className="text-primary font-semibold hover:underline">Back to Home</Link>
    </div>
  )

  const currentStageIndex = order.stages.findIndex((s) => s.id === order.status)

  return (
    <div className="bg-surface-container-low min-h-screen py-8">
      <div className="container-max max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-label-md text-on-surface-variant mb-1">Order ID</p>
            <h1 className="text-display-lg-mobile text-on-surface">Order #{order.id}</h1>
          </div>
          <div className="text-right">
            <p className="text-label-sm text-on-surface-variant">Placed on</p>
            <p className="text-label-md font-semibold text-on-surface">
              {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ETA Banner */}
        <div className="bg-primary rounded-[20px] p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary-container/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '24px' }} aria-hidden="true">local_shipping</span>
          </div>
          <div className="flex-1">
            <p className="text-label-sm text-white/60 mb-0.5">Live ETA</p>
            <p className="text-headline-sm text-white font-bold">{order.eta}</p>
          </div>
          <div className="text-right">
            <p className="text-label-sm text-white/60">Status</p>
            <p className="text-label-md font-semibold text-secondary-container capitalize">
              {order.status.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Order Stepper */}
        <div className="bg-white rounded-[28px] shadow-card p-6 mb-6">
          <h2 className="text-headline-sm text-on-surface mb-6">Tracking</h2>
          <div className="space-y-0">
            {order.stages.map((stage, i) => {
              const completed = i < currentStageIndex
              const active = i === currentStageIndex
              const pending = i > currentStageIndex
              return (
                <div key={stage.id} className="flex items-start gap-4">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        completed ? 'bg-success' : active ? 'bg-primary' : 'bg-surface-container-high'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined ${completed ? 'filled' : ''} ${
                          completed || active ? 'text-white' : 'text-outline'
                        }`}
                        style={{ fontSize: '20px' }}
                        aria-hidden="true"
                      >
                        {completed ? 'check_circle' : stage.icon}
                      </span>
                    </motion.div>
                    {i < order.stages.length - 1 && (
                      <div className="w-0.5 h-10 relative overflow-hidden bg-surface-container-high">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: completed ? 1 : 0 }}
                          transition={{ duration: 0.4, delay: i * 0.15 }}
                          style={{ transformOrigin: 'top' }}
                          className="absolute inset-0 bg-success"
                        />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className={`pb-8 ${i < order.stages.length - 1 ? '' : 'pb-0'}`}>
                    <p className={`text-label-md font-semibold ${pending ? 'text-outline' : 'text-on-surface'}`}>
                      {stage.label}
                    </p>
                    {stage.completedAt && (
                      <p className="text-label-sm text-on-surface-variant">
                        {new Date(stage.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {active && (
                      <p className="text-label-sm text-primary font-semibold mt-0.5">In Progress…</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Freshness Score */}
          <FreshnessScoreCard
            score={order.freshnessScore}
            catchTime={order.catchTime}
            batchFreshness={order.freshnessScore >= 95 ? 'Excellent' : 'Very Good'}
            metrics={[
              { icon: 'thermostat', label: 'Pack Temp', value: '2°C' },
              { icon: 'verified', label: 'QC Status', value: 'Passed' },
            ]}
          />

          {/* Order Details */}
          <div className="bg-white rounded-[28px] shadow-card p-5 space-y-4">
            <h2 className="text-headline-sm text-on-surface">Order Details</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-[8px] object-cover flex-shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-label-md font-semibold text-on-surface truncate">{item.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{item.weight} × {item.quantity}</p>
                </div>
                <p className="text-label-md font-bold text-on-surface flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t border-outline-variant pt-3 flex justify-between">
              <span className="text-label-md font-bold text-on-surface">Total</span>
              <span className="text-headline-sm font-black text-on-surface">₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-[28px] shadow-card p-5">
            <h2 className="text-headline-sm text-on-surface mb-3">Delivery Address</h2>
            <p className="text-label-md font-semibold text-on-surface">{order.address.name}</p>
            <p className="text-body-md text-on-surface-variant">{order.address.line1}</p>
            <p className="text-body-md text-on-surface-variant">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
            <p className="text-label-md text-on-surface-variant mt-1">{order.address.phone}</p>
          </div>

          {/* Customer Care */}
          {order.agent && (
            <div className="bg-white rounded-[28px] shadow-card p-5">
              <h2 className="text-headline-sm text-on-surface mb-3">Delivery Agent</h2>
              <div className="flex items-center gap-3 mb-4">
                <img src={order.agent.avatar} alt={order.agent.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-label-md font-semibold text-on-surface">{order.agent.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{order.agent.phone}</p>
                </div>
              </div>
              <a
                href={`tel:${order.agent.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-success text-on-success rounded-full text-label-md font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">call</span>
                Call Agent
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
