import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useToastStore from '@/store/toastStore'
import { getCustomerOrders, toggleCustomerStatus, updateAdminOrderStatus } from '@/services/adminApi'
import {
  AdminPage,
  AdminCard,
  StatusBadge,
  AdminBtn,
  formatCurrency,
  formatDate,
} from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'

export default function CustomerDetail() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()

  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState({})

  async function loadCustomerData() {
    setLoading(true)
    try {
      const res = await getCustomerOrders(customerId)
      if (res.success) {
        setCustomer(res.customer)
        setOrders(res.orders)
        setStats(res.stats)
      } else {
        addToast({ message: res.error || 'Failed to fetch customer data', type: 'error' })
      }
    } catch (err) {
      console.error('Error fetching customer details:', err)
      addToast({ message: err.message || 'Failed to fetch customer data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomerData()
  }, [customerId])

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active'
    
    if (nextStatus === 'suspended') {
      const confirmSuspend = window.confirm('Are you sure you want to suspend this customer account?')
      if (!confirmSuspend) return
    }

    setUpdatingStatus(true)
    try {
      const res = await toggleCustomerStatus(id, nextStatus)
      if (res.success) {
        setCustomer(prev => ({ ...prev, status: nextStatus }))
        addToast({ message: `Customer account has been ${nextStatus === 'suspended' ? 'suspended' : 'activated'}!`, type: 'success' })
      } else {
        addToast({ message: res.error || 'Failed to update customer status', type: 'error' })
      }
    } catch (err) {
      addToast({ message: err.message || 'Failed to update customer status', type: 'error' })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleStatusChange = async (orderDbId, newStatus) => {
    try {
      const res = await updateAdminOrderStatus(orderDbId, newStatus)
      if (res.success) {
        // Update order in state list
        setOrders(prev =>
          prev.map(o => (o.dbId === orderDbId ? { ...o, status: newStatus } : o))
        )
        addToast({ message: `Order status successfully updated to "${newStatus.replace(/_/g, ' ')}"!`, type: 'success' })
      } else {
        addToast({ message: res.error || 'Failed to update order status', type: 'error' })
      }
    } catch (err) {
      addToast({ message: err.message || 'Failed to update order status', type: 'error' })
    }
  }

  const toggleOrderExpand = (dbId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [dbId]: !prev[dbId]
    }))
  }

  if (loading) {
    return (
      <AdminPage>
        <SeafoodLoader text="Loading customer profile..." className="min-h-[50vh]" />
      </AdminPage>
    )
  }

  if (!customer) {
    return (
      <AdminPage>
        <div className="text-center py-20 bg-white rounded-[16px] border border-admin-border/60 p-5">
          <span className="material-symbols-outlined text-admin-text-sub mb-4" style={{ fontSize: '48px' }}>person_off</span>
          <p className="text-admin-text-sub font-medium">Customer not found.</p>
          <AdminBtn className="mt-4" onClick={() => navigate('/admin/customers')}>Back to Customers</AdminBtn>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage
      back={
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 group transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
            ←
          </span>
          Back to Customers
        </button>
      }
    >
      <div className="space-y-6">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-[16px] border border-admin-border/60 p-6 shadow-[0_2px_12px_rgba(11,30,61,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-admin-seafoam flex items-center justify-center text-admin-navy text-2xl font-bold border border-admin-border/40">
                {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-admin-navy">{customer.name}</h1>
                  <StatusBadge status={customer.status} />
                </div>
                <p className="text-sm text-admin-text-sub mt-0.5">
                  {customer.email} &bull; {customer.phone || 'No phone'}
                </p>
                <p className="text-xs text-admin-text-sub mt-1">
                  Joined: {formatDate(customer.joinedAt)}
                </p>
              </div>
            </div>
            
            {customer.status !== 'guest' && (
              <div>
                <button
                  onClick={() => handleToggleStatus(customer.id, customer.status)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-100 ${
                    customer.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  {customer.status === 'active' ? 'Suspend Customer' : 'Activate Customer'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
            <p className="text-2xl font-bold text-admin-navy">{stats?.total_orders || 0}</p>
            <p className="text-[11px] text-admin-text-sub mt-0.5">Total Orders</p>
          </div>
          <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
            <p className="text-2xl font-bold text-admin-navy">{formatCurrency(stats?.total_spent || 0)}</p>
            <p className="text-[11px] text-admin-text-sub mt-0.5">Total Spent</p>
          </div>
          <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
            <p className="text-2xl font-bold capitalize text-admin-navy">{customer.status}</p>
            <p className="text-[11px] text-admin-text-sub mt-0.5">Account Status</p>
          </div>
          <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
            <p className="text-2xl font-bold text-admin-gold truncate max-w-full px-2">
              {customer.subscription_plan || 'None'}
            </p>
            <p className="text-[11px] text-admin-text-sub mt-0.5">Subscription Plan</p>
          </div>
        </div>

        {/* Order History Section */}
        <div>
          <h2 className="text-md font-bold text-admin-navy uppercase tracking-wider mb-4">
            Order History
          </h2>
          
          {orders.length === 0 ? (
            <div className="bg-white rounded-[16px] border border-admin-border/60 p-12 text-center">
              <span className="material-symbols-outlined text-gray-200 mb-4" style={{ fontSize: '48px' }}>
                shopping_bag
              </span>
              <p className="text-gray-400 font-medium">No orders yet</p>
              <p className="text-gray-300 text-sm mt-1">This customer hasn't placed any orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.dbId]
                return (
                  <div
                    key={order.dbId}
                    className="bg-white rounded-[16px] border border-admin-border/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-100"
                  >
                    {/* Header */}
                    <div 
                      onClick={() => toggleOrderExpand(order.dbId)}
                      className="p-4 md:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer bg-admin-seafoam/10 hover:bg-admin-seafoam/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-admin-navy text-sm font-mono">{order.id}</span>
                        <StatusBadge status={order.status} />
                        <span className="text-xs text-admin-text-sub">
                          {formatDate(order.placedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-admin-navy text-sm">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="material-symbols-outlined text-admin-text-sub select-none transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                          expand_more
                        </span>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="p-4 md:p-5 border-t border-admin-border/20 space-y-4 text-xs md:text-sm">
                        {/* Order Items */}
                        <div>
                          <p className="font-bold text-admin-navy mb-2">Items:</p>
                          <ul className="space-y-1.5 list-disc pl-5 text-admin-text">
                            {order.items?.map((item, idx) => (
                              <li key={idx}>
                                {item.name} &times; {item.quantity} ({item.weight}) &mdash;{' '}
                                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <hr className="border-admin-border/20" />

                        {/* Bill Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg text-admin-text">
                          <div>
                            <span className="text-admin-text-sub block text-[10px] uppercase">Subtotal</span>
                            <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-sub block text-[10px] uppercase">Discount</span>
                            <span className="font-semibold text-admin-coral">-{formatCurrency(order.discount)}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-sub block text-[10px] uppercase">Shipping</span>
                            <span className="font-semibold">{formatCurrency(order.shipping)}</span>
                          </div>
                          <div>
                            <span className="text-admin-text-sub block text-[10px] uppercase font-bold text-admin-navy">Total</span>
                            <span className="font-bold text-admin-navy">{formatCurrency(order.total)}</span>
                          </div>
                        </div>

                        {/* Delivery & Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-admin-text">
                          <div className="space-y-1">
                            <p>
                              <strong className="text-admin-navy">Payment:</strong>{' '}
                              <span className="capitalize">{order.paymentMethod === 'razorpay' ? 'Razorpay ✅' : 'COD 💵'}</span>{' '}
                              &bull; <span className="capitalize font-medium">{order.paymentStatus}</span>
                            </p>
                            <p>
                              <strong className="text-admin-navy">Delivery Slot:</strong> {order.address?.slot || order.deliverySlot || 'Standard Delivery'}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="strong text-admin-navy font-bold">Delivery Address:</p>
                            <p className="text-admin-text-sub leading-relaxed">
                              {order.address?.name && <span>{order.address.name}<br /></span>}
                              {order.address?.line1 || order.address?.address || ''}, {order.address?.city || ''} - {order.address?.pincode || ''}
                              {order.address?.phone && <span><br />Phone: {order.address.phone}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Change Status Dropdown */}
                        <div className="flex items-center justify-between border-t border-admin-border/20 pt-4 mt-2">
                          <span className="text-admin-text-sub font-medium">Update Status</span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.dbId, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-admin-navy font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="accepted">Accepted</option>
                            <option value="packed">Packed on Ice</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  )
}
