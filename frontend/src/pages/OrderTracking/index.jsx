import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import FreshnessScoreCard from '@/components/ui/FreshnessScoreCard'
import { SeafoodLoader } from '@/components/ui'
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

  if (loading) {
    return <SeafoodLoader text="Retrieving order tracking info…" className="min-h-[60vh]" />
  }

  if (!order) {
    return (
      <div className="container-max py-32 text-center">
        <span className="material-symbols-outlined text-outline text-6xl mb-4 block" aria-hidden="true">
          search_off
        </span>
        <h1 className="font-serif text-display-lg-mobile text-on-surface mb-2">Order Not Found</h1>
        <p className="text-body-md text-on-surface-variant mb-8">Order ID: <span className="font-mono font-bold text-primary">{orderId}</span></p>
        <Link to="/" className="inline-flex px-6 py-2.5 bg-primary text-white rounded-full text-label-md font-semibold hover:opacity-90 transition-opacity">
          Back to Shore
        </Link>
      </div>
    )
  }

  const trackingStatus = order.status === 'accepted' ? 'confirmed' : order.status
  const currentStageIndex = order.stages.findIndex((s) => s.id === trackingStatus)

  return (
    <div className="bg-surface-container-low min-h-screen py-8 md:py-12">
      <div className="container-max max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-white hover:border-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant font-bold" style={{ fontSize: '20px' }}>
                arrow_back
              </span>
            </Link>
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">Live Tracking</p>
              <h1 className="text-display-lg-mobile text-on-surface font-black">Order #{order.id}</h1>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5">Placed on</p>
            <p className="text-label-md font-bold text-on-surface">
              {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ETA Banner */}
        <div className="bg-gradient-to-r from-[#000516] via-[#0b1e3d] to-[#122b54] rounded-[28px] p-6 mb-8 shadow-card border border-white/10 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
          {/* Subtle glowing halo in the background */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary-container/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <div className="w-14 h-14 bg-secondary-container/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-secondary-container/30">
              {/* Pulsing ring behind the shipping icon */}
              <span className="absolute inset-0 rounded-2xl bg-secondary-container/10 animate-pulse" />
              <motion.span 
                animate={{ 
                  x: [-2, 2, -2],
                  y: [0, -2, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2.5, 
                  ease: 'easeInOut' 
                }}
                className="material-symbols-outlined text-secondary-container flex items-center justify-center" 
                style={{ fontSize: '28px' }}
                aria-hidden="true"
              >
                local_shipping
              </motion.span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-1">
              <p className="text-label-sm text-secondary-container/85 tracking-widest uppercase font-extrabold">Live Delivery Status</p>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            </div>
            <p className="text-[26px] sm:text-[30px] text-white font-black tracking-tight leading-tight">{order.eta}</p>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
            <p className="text-label-sm text-white/50 tracking-wider uppercase mb-1">Current Phase</p>
            <span className="inline-flex px-3.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold uppercase tracking-wider">
              {order.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Desktop Horizontal Stepper */}
        <div className="hidden md:block bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-8 mb-8">
          <h2 className="text-headline-sm text-on-surface mb-8 font-serif">Delivery Progress</h2>
          <div className="flex items-start justify-between relative pt-2">
            {/* Connector lines behind circles */}
            <div className="absolute top-7 left-12 right-12 h-[3px] bg-surface-container-high -z-10 rounded-full" />
            <div 
              className="absolute top-7 left-12 h-[3px] bg-success transition-all duration-500 -z-10 rounded-full" 
              style={{ width: `${(currentStageIndex / (order.stages.length - 1)) * 74 + 3}%` }}
            />

            {order.stages.map((stage, i) => {
              const completed = i < currentStageIndex
              const active = i === currentStageIndex
              const pending = i > currentStageIndex

              return (
                <div key={stage.id} className="flex flex-col items-center flex-1 text-center relative">
                  {/* Circle icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center relative shadow-sm border transition-all ${
                      completed 
                        ? 'bg-success border-success text-white' 
                        : active 
                          ? 'bg-primary border-primary text-white ring-4 ring-primary/20' 
                          : 'bg-white border-outline-variant/50 text-outline'
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10" />
                    )}
                    <span
                      className={`material-symbols-outlined ${completed ? 'filled' : ''}`}
                      style={{ fontSize: '20px' }}
                    >
                      {completed ? 'check' : stage.icon}
                    </span>
                  </motion.div>

                  {/* Stage Label */}
                  <div className="mt-4 px-2">
                    <p className={`text-label-sm font-bold uppercase tracking-wider ${active ? 'text-primary font-extrabold' : pending ? 'text-outline' : 'text-on-surface'}`}>
                      {stage.label}
                    </p>
                    {stage.completedAt ? (
                      <p className="text-[11px] text-on-surface-variant mt-1 font-mono">
                        {new Date(stage.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : active ? (
                      <p className="text-[11px] text-primary font-bold mt-1 animate-pulse">In Progress</p>
                    ) : (
                      <p className="text-[11px] text-outline mt-1">—</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Vertical Stepper */}
        <div className="block md:hidden bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6 mb-8">
          <h2 className="text-headline-sm text-on-surface mb-6 font-serif">Delivery Progress</h2>
          <div className="space-y-0 pl-1">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-sm border transition-all ${
                        completed 
                          ? 'bg-success border-success text-white' 
                          : active 
                            ? 'bg-primary border-primary text-white ring-4 ring-primary/20' 
                            : 'bg-white border-outline-variant/50 text-outline'
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping -z-10" />
                      )}
                      <span
                        className={`material-symbols-outlined ${completed ? 'filled' : ''}`}
                        style={{ fontSize: '18px' }}
                      >
                        {completed ? 'check' : stage.icon}
                      </span>
                    </motion.div>
                    {i < order.stages.length - 1 && (
                      <div className="w-[3px] h-10 bg-surface-container-high my-1.5 rounded-full relative">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: completed ? 1 : 0 }}
                          transition={{ duration: 0.4, delay: i * 0.15 }}
                          style={{ transformOrigin: 'top' }}
                          className="absolute inset-0 bg-success rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className={`pb-6 ${i < order.stages.length - 1 ? '' : 'pb-0'}`}>
                    <p className={`text-label-md font-bold uppercase tracking-wider ${active ? 'text-primary' : pending ? 'text-outline' : 'text-on-surface'}`}>
                      {stage.label}
                    </p>
                    {stage.completedAt && (
                      <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                        {new Date(stage.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {active && (
                      <p className="text-[11px] text-primary font-bold mt-0.5 animate-pulse">In Progress…</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
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
          <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-headline-sm text-on-surface font-serif mb-5">Order Details</h2>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-[12px] object-cover flex-shrink-0 border border-outline-variant/30" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md font-bold text-on-surface truncate">{item.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{item.weight} × {item.quantity}</p>
                    </div>
                    <p className="text-label-md font-extrabold text-on-surface flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-outline-variant/30 pt-4 mt-6 flex justify-between items-center">
              <span className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">Total Amount</span>
              <span className="text-headline-md font-black text-primary">₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6">
            <h2 className="text-headline-sm text-on-surface font-serif mb-4">Delivery Address</h2>
            <div className="space-y-1.5">
              <p className="text-label-md font-bold text-on-surface">{order.address.name}</p>
              <p className="text-body-md text-on-surface-variant">{order.address.line1}</p>
              <p className="text-body-md text-on-surface-variant">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              <div className="border-t border-outline-variant/20 pt-3 mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '16px' }}>call</span>
                <span className="font-mono">{order.address.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-headline-sm text-on-surface font-serif mb-5">Payment Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
                  <span className="text-body-md text-on-surface-variant">Method</span>
                  <span className="text-label-md font-bold text-on-surface uppercase">
                    {order.paymentMethod === 'razorpay' ? 'Razorpay (Online)' : 'Cash on Delivery (COD)'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
                  <span className="text-body-md text-on-surface-variant">Status</span>
                  {order.paymentMethod === 'cod' ? (
                    <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      Cash on Delivery
                    </span>
                  ) : order.paymentStatus === 'paid' ? (
                    <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-body-sm text-on-surface-variant">Payment Ref ID</span>
                    <span className="text-body-sm font-mono text-outline select-all">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Agent */}
          {order.agent && (
            <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-headline-sm text-on-surface font-serif mb-4">Delivery Partner</h2>
                <div className="flex items-center gap-4 py-2">
                  <img src={order.agent.avatar} alt={order.agent.name} className="w-14 h-14 rounded-full object-cover border border-outline-variant/20 shadow-sm" />
                  <div>
                    <p className="text-label-md font-bold text-on-surface">{order.agent.name}</p>
                    <p className="text-label-sm text-on-surface-variant font-mono">{order.agent.phone}</p>
                    <p className="text-[11px] text-success font-semibold flex items-center gap-1 mt-0.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
                      On route
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href={`tel:${order.agent.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-success text-on-success rounded-full text-label-md font-bold hover:bg-success/95 transition-colors shadow-sm select-none"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">call</span>
                  Call Delivery Partner
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
