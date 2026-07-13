import { useNavigate } from 'react-router-dom'
import { ADMIN_KPI, ADMIN_ORDERS } from '@/mock/adminData'
import { KpiCard, AdminCard, AdminPage, AdminTable, Tr, Td, StatusBadge, AdminBtn, formatCurrency, formatDate } from '@/admin/AdminUI'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const kpi = ADMIN_KPI
  const maxRevenue = Math.max(...kpi.weeklyRevenue)
  const maxOrders = Math.max(...kpi.weeklyOrders)

  return (
    <AdminPage>
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Today's Revenue"    value={formatCurrency(kpi.todayRevenue)}    icon="payments"        iconColor="text-admin-gold"    trend={kpi.revenueGrowth}   sub="vs yesterday" />
        <KpiCard title="Orders Today"       value={kpi.todayOrders}                     icon="receipt_long"    iconColor="text-blue-500"      trend={kpi.orderGrowth}     sub="vs yesterday" />
        <KpiCard title="Active Customers"   value={kpi.activeCustomers.toLocaleString()}icon="group"           iconColor="text-admin-success"  trend={kpi.customerGrowth}  sub="this month" />
        <KpiCard title="Pending Orders"     value={kpi.pendingOrders}                   icon="pending_actions" iconColor="text-admin-coral"    trend={kpi.pendingChange}    sub="need attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Weekly Revenue Chart */}
        <AdminCard title="Weekly Revenue" className="lg:col-span-2">
          <div className="px-5 pt-4 pb-5">
            {/* Revenue chart — explicit pixel heights so bars always render */}
            <div className="flex items-end gap-2" style={{ height: '128px' }}>
              {kpi.weeklyRevenue.map((v, i) => {
                const barPx = Math.max(4, Math.round((v / maxRevenue) * 112)) // 112px max bar, 16px for label
                const isToday = i === 6
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: '128px' }}>
                    <div
                      title={`₹${v.toLocaleString('en-IN')}`}
                      style={{
                        height: `${barPx}px`,
                        background: isToday ? '#C9A227' : '#0B1E3D',
                        opacity: isToday ? 1 : 0.25 + i * 0.1,
                        flexShrink: 0,
                      }}
                      className="w-full rounded-t-md transition-all duration-300"
                    />
                    <span className="text-[9px] text-admin-text-sub whitespace-nowrap" style={{ flexShrink: 0 }}>
                      {WEEK_DAYS[i]}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Revenue range labels */}
            <div className="flex justify-between mt-2">
              <span className="text-[9px] text-admin-text-sub">₹0</span>
              <span className="text-[9px] text-admin-text-sub font-semibold text-admin-gold">
                Today: ₹{kpi.todayRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-admin-text-sub">₹{maxRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </AdminCard>

        {/* Order Status Breakdown */}
        <AdminCard title="Order Status">
          <div className="p-5 space-y-3">
            {Object.entries(kpi.orderStatusBreakdown).map(([status, count]) => {
              const total = Object.values(kpi.orderStatusBreakdown).reduce((a, b) => a + b, 0)
              const pct = Math.round((count / total) * 100)
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <StatusBadge status={status} />
                    <span className="text-[12px] font-bold text-admin-navy">{count}</span>
                  </div>
                  <div className="h-1.5 bg-admin-seafoam rounded-full overflow-hidden">
                    <div className="h-full bg-admin-navy rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Products */}
        <AdminCard title="Top Products This Week" className="lg:col-span-2">
          <AdminTable headers={['Product', 'Units Sold', 'Revenue']}>
            {kpi.topProducts.map((p, i) => (
              <Tr key={p.name}>
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-admin-navy/10 flex items-center justify-center text-[10px] font-bold text-admin-navy">{i + 1}</span>
                    {p.name}
                  </div>
                </Td>
                <Td>{p.sales}</Td>
                <Td className="font-semibold">{formatCurrency(p.revenue)}</Td>
              </Tr>
            ))}
          </AdminTable>
        </AdminCard>

        {/* Recent Orders */}
        <AdminCard title="Recent Orders" action={<AdminBtn size="sm" variant="secondary" onClick={() => navigate('/admin/orders')}>View All</AdminBtn>}>
          <div className="divide-y divide-admin-border/30">
            {ADMIN_ORDERS.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="px-4 py-3 hover:bg-admin-seafoam/60 cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/orders/${o.id}`)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-admin-navy">{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-[11px] text-admin-text-sub">{o.customer.name} — {formatCurrency(o.total)}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  )
}
