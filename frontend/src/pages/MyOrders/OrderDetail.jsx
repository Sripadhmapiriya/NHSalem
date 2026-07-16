import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getOrderStatus } from '@/services/api'
import useToastStore from '@/store/toastStore'
import { SeafoodLoader } from '@/components/ui'

const statusColors = {
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  accepted: 'bg-green-50 text-green-700 border border-green-200',
  preparing: 'bg-amber-50 text-amber-700 border border-amber-200',
  packed: 'bg-amber-50 text-amber-700 border border-amber-200',
  out_for_delivery: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}

const statusLabels = {
  confirmed: 'Confirmed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  packed: 'Packed on Ice',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function OrderDetail() {
  const { orderRef } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrderDetail() {
      try {
        const data = await getOrderStatus(orderRef)
        setOrder(data)
      } catch (err) {
        console.error('Error fetching order details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrderDetail()
  }, [orderRef])

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderRef)
    addToast({ message: '📋 Order ID copied!', type: 'success' })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-surface-container-low">
        <SeafoodLoader text="Retrieving order details…" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-max py-32 text-center">
        <span className="material-symbols-outlined text-outline text-6xl mb-4 block" aria-hidden="true">
          search_off
        </span>
        <h1 className="font-serif text-3xl font-extrabold text-on-surface mb-2">Order Not Found</h1>
        <p className="text-sm text-on-surface-variant mb-8">
          Order ID: <span className="font-mono font-bold text-primary">{orderRef}</span>
        </p>
        <Link
          to="/my-orders"
          className="inline-flex px-6 py-2.5 bg-primary text-white rounded-full text-label-md font-semibold hover:opacity-90 transition-opacity"
        >
          Back to My Orders
        </Link>
      </div>
    )
  }

  const statusKey = order.status?.toLowerCase() || 'confirmed'
  const trackingStatus = order.status === 'accepted' ? 'confirmed' : order.status
  const currentStageIndex = order.stages.findIndex((s) => s.id === trackingStatus)

  return (
    <div className="bg-surface-container-low min-h-screen py-8 md:py-12">
      <div className="container-max max-w-4xl px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/my-orders"
              className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center bg-white hover:border-primary transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-on-surface-variant font-bold" style={{ fontSize: '20px' }}>
                arrow_back
              </span>
            </Link>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Order Details</p>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-on-surface">Order #{order.id}</h1>
                <button
                  onClick={handleCopyOrderId}
                  className="text-primary hover:bg-primary/5 p-1 rounded-full transition-colors flex items-center"
                  title="Copy Order ID"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-0.5">Placed on</p>
            <p className="text-sm md:text-base font-bold text-on-surface">
              {new Date(order.placedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Outer Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content: Timeline + Items */}
          <div className="md:col-span-2 space-y-8">
            {/* Timeline */}
            <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6">
              <h2 className="text-lg font-bold text-on-surface mb-6 font-serif">Status History</h2>
              
              {/* Vertical timeline for mobile, horizontal stepper is simplified here */}
              <div className="flex flex-col gap-6 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                {order.stages.map((stage, i) => {
                  const completed = i <= currentStageIndex
                  const active = i === currentStageIndex

                  return (
                    <div key={stage.id} className="relative flex items-start gap-4">
                      {/* Circle indicator */}
                      <span
                        className={`absolute -left-[22px] w-[14px] h-[14px] rounded-full border-2 ${
                          completed
                            ? 'bg-success border-success'
                            : 'bg-white border-outline-variant/60'
                        } flex items-center justify-center`}
                      >
                        {active && (
                          <span className="absolute w-5 h-5 rounded-full bg-success/20 animate-ping" />
                        )}
                      </span>
                      
                      <div className="flex-1">
                        <p
                          className={`text-sm font-bold uppercase tracking-wider ${
                            active ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {stage.label}
                        </p>
                        {stage.completedAt && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                            {new Date(stage.completedAt).toLocaleString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items list */}
            <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4 font-serif">Items Summary</h2>
              <div className="divide-y divide-outline-variant/20">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <img
                      src={item.image || '/crest.png'}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/20 bg-surface-container-low flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{item.name}</p>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {item.weight} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-black text-on-surface">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Totals + Delivery Info */}
          <div className="space-y-8">
            {/* Payment & Totals */}
            <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6">
              <h2 className="text-lg font-bold text-on-surface mb-4 font-serif">Bill Summary</h2>
              
              <div className="space-y-2 text-xs md:text-sm border-b border-outline-variant/20 pb-4">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Delivery fee</span>
                  <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm md:text-base font-black text-on-surface pt-4">
                <span>Total Bill</span>
                <span className="text-primary text-lg">₹{order.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery address & slot */}
            <div className="bg-white rounded-[28px] shadow-card border border-outline-variant/30 p-6 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-on-surface-variant tracking-wider mb-2">
                  Delivery Address
                </h3>
                <div className="text-xs md:text-sm text-on-surface font-semibold space-y-0.5">
                  <p>{order.address?.name}</p>
                  <p>{order.address?.phone}</p>
                  <p>{order.address?.line1 || order.address?.street}</p>
                  <p>
                    {order.address?.city}, {order.address?.state} - {order.address?.pincode}
                  </p>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <h3 className="text-xs font-black uppercase text-on-surface-variant tracking-wider mb-1">
                  Delivery Slot
                </h3>
                <p className="text-xs md:text-sm font-bold text-on-surface">{order.estimatedDelivery || '7–9 AM'}</p>
              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <h3 className="text-xs font-black uppercase text-on-surface-variant tracking-wider mb-1">
                  Payment Method
                </h3>
                <p className="text-xs md:text-sm font-bold text-on-surface uppercase">
                  {order.paymentMethod} ({order.paymentStatus === 'paid' ? 'Paid' : 'Pending'})
                </p>
              </div>
            </div>

            {/* Help Button */}
            <a
              href="mailto:support@nhsalem.com?subject=Help with Order ID: "
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full border border-primary text-primary hover:bg-primary/5 text-xs font-extrabold transition-all text-center"
            >
              <span className="material-symbols-outlined text-[16px]">help</span>
              Need Help? Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
