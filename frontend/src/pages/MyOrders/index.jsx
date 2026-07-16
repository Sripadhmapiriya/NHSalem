import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getUserOrders } from '@/services/api'
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

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { addToast } = useToastStore()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getUserOrders()
        // If data is wrapped in an object like { success: true, orders: [...] }, extract it.
        // Otherwise, use it directly.
        const list = Array.isArray(data) ? data : (data.orders || [])
        setOrders(list)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to load your orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleCopyOrderId = (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(orderId)
    addToast({ message: '📋 Order ID copied!', type: 'success' })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-surface-container-low">
        <SeafoodLoader text="Retrieving your orders…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8 md:py-12">
      <div className="container-max max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">My Orders</h1>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
            {orders.length}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[28px] p-8 text-center border border-outline-variant/30 shadow-card"
          >
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4">
              local_shipping
            </span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No Orders Yet</h3>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              Looks like you haven't placed any orders yet. Check out our fresh seafood menu to get started!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-sm transition-all"
            >
              Order Fresh Catch
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => {
              const formattedDate = order.placedAt
                ? new Date(order.placedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A'

              const itemsString = order.items
                ?.map((item) => `${item.name} × ${item.quantity}`)
                .join(', ') || 'No items listed'

              const statusKey = order.status?.toLowerCase() || 'confirmed'

              return (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={order.id}
                  className="bg-white rounded-[24px] border border-outline-variant/30 p-5 md:p-6 shadow-sm hover:shadow-card transition-all"
                >
                  {/* Card Header: Order ID + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm md:text-base font-black text-on-surface">
                        Order #{order.id}
                      </span>
                      <button
                        onClick={(e) => handleCopyOrderId(e, order.id)}
                        className="text-primary hover:bg-primary/5 p-1 rounded-full transition-colors flex items-center"
                        title="Copy Order ID"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full select-none self-start sm:self-auto ${
                        statusColors[statusKey] || statusColors.confirmed
                      }`}
                    >
                      {statusLabels[statusKey] || order.status}
                    </span>
                  </div>

                  {/* Card Body: Placed on + Total Price + Items */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs md:text-sm text-on-surface-variant font-medium">
                      <span>Placed on: {formattedDate}</span>
                      <span>•</span>
                      <span className="font-extrabold text-on-surface">
                        ₹{order.total?.toLocaleString()}
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 ml-2">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-on-surface-variant truncate font-medium">
                      <span className="text-on-surface font-bold">Items: </span>
                      {itemsString}
                    </p>
                  </div>

                  {/* Card Footer: Action buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-outline-variant/10">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">radar</span>
                      Track Order
                    </button>
                    <button
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-outline-variant hover:bg-surface-container-low text-on-surface font-bold text-xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      View Details
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
