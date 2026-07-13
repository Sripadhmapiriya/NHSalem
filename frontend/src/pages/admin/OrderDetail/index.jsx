import { useParams, useNavigate } from 'react-router-dom'
import { ADMIN_ORDERS } from '@/mock/adminData'
import ORDERS from '@/mock/orders'
import { AdminPage, AdminCard, StatusBadge, AdminBtn, formatCurrency, formatDate } from '@/admin/AdminUI'

const STAGE_ICONS = {
  confirmed: 'check',
  packed: 'ac_unit',
  out_for_delivery: 'local_shipping',
  delivered: 'home',
}

const getStepStyles = (done, active) => {
  if (done) {
    return {
      circleBg: '#1B7A45', // admin-success
      circleBorder: '#1B7A45',
      iconColor: '#ffffff',
      fill: 1
    }
  }
  if (active) {
    return {
      circleBg: '#ffffff',
      circleBorder: '#C9A227', // admin-gold (current step indicator)
      iconColor: '#C9A227', // gold
      fill: 1
    }
  }
  return {
    circleBg: '#ffffff',
    circleBorder: '#D1DAE3', // admin-border
    iconColor: '#94A3B8', // muted slate
    fill: 0
  }
}

// Merge mock order sources for detail view
function getOrderDetail(id) {
  // Try extended mock first
  const admin = ADMIN_ORDERS.find((o) => o.id === id)
  // Try tracking mock for stage data
  const tracking = ORDERS[id]
  if (!admin && !tracking) return null
  return {
    ...admin,
    ...tracking,
    id: id,
    customer: admin?.customer ?? { name: tracking?.address?.name, phone: tracking?.address?.phone, email: '' },
    address: tracking?.address ?? null,
    stages: tracking?.stages ?? [],
    items: tracking?.items ?? [],
    total: tracking?.total ?? admin?.total,
    subtotal: tracking?.subtotal ?? admin?.total,
    shipping: tracking?.shipping ?? 0,
    freshnessScore: tracking?.freshnessScore,
    agent: tracking?.agent,
    placedAt: admin?.placedAt ?? tracking?.placedAt,
    status: admin?.status ?? tracking?.status,
    paymentMethod: admin?.paymentMethod ?? 'N/A',
    paymentStatus: admin?.paymentStatus ?? 'paid',
  }
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const order = getOrderDetail(id)

  if (!order) {
    return (
      <AdminPage>
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-admin-text-sub mb-4" style={{ fontSize: '48px' }}>receipt_long</span>
          <p className="text-admin-text-sub font-medium">Order <span className="font-mono font-bold">{id}</span> not found.</p>
          <AdminBtn className="mt-4" onClick={() => navigate('/admin/orders')}>Back to Orders</AdminBtn>
        </div>
      </AdminPage>
    )
  }

  const STAGE_ORDER = ['confirmed', 'packed', 'out_for_delivery', 'delivered']
  const currentStageIdx = STAGE_ORDER.indexOf(order.status)

  return (
    <AdminPage
      back={
        <AdminBtn variant="secondary" icon="arrow_back" onClick={() => navigate('/admin/orders')}>
          Back
        </AdminBtn>
      }
      action={
        <>
          <AdminBtn variant="secondary" icon="print">Print Invoice</AdminBtn>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <AdminBtn variant="primary" icon="local_shipping">Update Status</AdminBtn>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order info + items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <AdminCard>
            <div className="p-5 flex flex-wrap items-start gap-4 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-admin-navy font-mono">{order.id}</h2>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-[12px] text-admin-text-sub">Placed: {formatDate(order.placedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-admin-text-sub uppercase tracking-wide">Order Total</p>
                <p className="text-2xl font-bold text-admin-navy">{formatCurrency(order.total)}</p>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </AdminCard>

          {/* Items */}
          {order.items?.length > 0 && (
            <AdminCard title="Items Ordered">
              <div className="divide-y divide-admin-border/30">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-[10px] object-cover flex-shrink-0 border border-admin-border/50" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-admin-navy">{item.name}</p>
                      <p className="text-[12px] text-admin-text-sub">{item.weight} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-admin-navy">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="px-5 py-3 bg-admin-seafoam/50 flex justify-end gap-8 text-[13px]">
                  <div className="text-right space-y-1">
                    <div className="flex justify-between gap-8 text-admin-text-sub"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                    <div className="flex justify-between gap-8 text-admin-text-sub"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span></div>
                    <div className="flex justify-between gap-8 font-bold text-admin-navy border-t border-admin-border/50 pt-1 mt-1"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
                  </div>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Tracking stages */}
          {order.stages?.length > 0 && (
            <AdminCard title="Fulfilment Timeline">
              <div className="p-5">
                <div className="relative">
                  {order.stages.map((stage, i) => {
                    const isDelivered = order.status === 'delivered'
                    const done = isDelivered ? true : i < currentStageIdx
                    const active = isDelivered ? false : i === currentStageIdx
                    const styles = getStepStyles(done, active)
                    const iconName = STAGE_ICONS[stage.id] ?? stage.icon

                    return (
                      <div key={stage.id} className="flex gap-4 mb-5 last:mb-0">
                        <div className="flex flex-col items-center">
                          <div
                            style={{
                              backgroundColor: styles.circleBg,
                              borderColor: styles.circleBorder,
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0"
                          >
                            <span
                              className="material-symbols-outlined leading-none"
                              style={{
                                fontSize: '15px',
                                color: styles.iconColor,
                                fontVariationSettings: `\'FILL\' ${styles.fill}`
                              }}
                            >
                              {iconName}
                            </span>
                          </div>
                          {i < order.stages.length - 1 && (
                            <div
                              style={{
                                width: '2px',
                                minHeight: '24px',
                                backgroundColor: done ? '#1B7A45' : '#D1DAE3',
                                flex: 1,
                                marginTop: '4px',
                              }}
                            />
                          )}
                        </div>
                        <div className="pt-1">
                          <p
                            style={{ color: done ? '#0B1E3D' : active ? '#C9A227' : '#4A5568' }}
                            className="text-[13px] font-bold"
                          >
                            {stage.label}
                          </p>
                          {stage.completedAt && (
                            <p className="text-[11px] text-admin-text-sub mt-0.5">
                              {formatDate(stage.completedAt)} — {new Date(stage.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AdminCard>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Customer */}
          <AdminCard title="Customer">
            <div className="p-4 space-y-2">
              <p className="font-semibold text-admin-navy">{order.customer?.name}</p>
              {order.customer?.email && <p className="text-[12px] text-admin-text-sub flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>email</span>{order.customer.email}</p>}
              {order.customer?.phone && <p className="text-[12px] text-admin-text-sub flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '13px' }}>call</span>{order.customer.phone}</p>}
              <AdminBtn size="sm" variant="secondary" icon="open_in_new" className="mt-2">View Profile</AdminBtn>
            </div>
          </AdminCard>

          {/* Delivery address */}
          {order.address && (
            <AdminCard title="Delivery Address">
              <div className="p-4 text-[13px] text-admin-text-sub space-y-0.5">
                <p className="font-semibold text-admin-navy">{order.address.name}</p>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p>{order.address.phone}</p>
              </div>
            </AdminCard>
          )}

          {/* Delivery agent */}
          {order.agent && (
            <AdminCard title="Delivery Agent">
              <div className="p-4 flex items-center gap-3">
                <img src={order.agent.avatar} alt={order.agent.name} className="w-10 h-10 rounded-full border border-admin-border" />
                <div>
                  <p className="font-semibold text-admin-navy text-[13px]">{order.agent.name}</p>
                  <p className="text-[12px] text-admin-text-sub">{order.agent.phone}</p>
                </div>
              </div>
            </AdminCard>
          )}

          {/* Payment */}
          <AdminCard title="Payment">
            <div className="p-4 text-[13px] space-y-1">
              <div className="flex justify-between"><span className="text-admin-text-sub">Method</span><span className="font-semibold">{order.paymentMethod}</span></div>
              <div className="flex justify-between items-center"><span className="text-admin-text-sub">Status</span><StatusBadge status={order.paymentStatus} /></div>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  )
}
