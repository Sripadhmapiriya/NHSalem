import { useState } from 'react'
import { ADMIN_CUSTOMERS } from '@/mock/adminData'
import {
  AdminPage,
  AdminCard,
  AdminTable,
  Tr,
  Td,
  StatusBadge,
  AdminBtn,
  AdminInput,
  Avatar,
  FilterBar,
  formatCurrency,
  formatDate,
} from '@/admin/AdminUI'

/**
 * CUSTOMERS PAGE — Status Column Reference
 * ─────────────────────────────────────────
 * The "Status" column reflects each customer's account lifecycle state.
 * Values and their meanings:
 *
 *   'active'   — Customer has placed at least one order and their account is
 *                in good standing. This is the most common state.
 *
 *   'inactive' — Customer registered but has not placed any recent orders, OR
 *                their account has been manually deactivated by an admin.
 *                Inactive customers can still log in but may not receive
 *                marketing emails (handled in the notification service).
 *
 *   'new'      — Customer has registered an account but has never placed an
 *                order (orders count = 0). This is a transient state that
 *                automatically upgrades to 'active' upon first order completion.
 *
 *   'suspended' — (Reserved for future use) Account is temporarily suspended
 *                 due to policy violations or payment disputes. Suspended
 *                 customers cannot log in or place orders.
 *
 * Status is set by:
 *   - The backend on order completion (new → active)
 *   - Admin manual override via the customer detail page (future feature)
 *   - Automated inactivity jobs (active → inactive after 180 days without orders)
 *
 * Rendering: StatusBadge renders each status with a distinct colour:
 *   active   → green   | inactive → grey  | new → blue  | suspended → red-grey
 */

export default function AdminCustomers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = ADMIN_CUSTOMERS.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCustomers = ADMIN_CUSTOMERS.length
  const activeCount = ADMIN_CUSTOMERS.filter((c) => c.status === 'active').length
  const avgSpend = Math.round(
    ADMIN_CUSTOMERS.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers
  )

  return (
    <AdminPage>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-navy">{totalCustomers}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Total Customers</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-success">{activeCount}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-[14px] border border-admin-border/60 p-4 text-center">
          <p className="text-2xl font-bold text-admin-gold">{formatCurrency(avgSpend)}</p>
          <p className="text-[11px] text-admin-text-sub mt-0.5">Avg. Spend</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <AdminInput
          id="customers-search"
          placeholder="Search name, email, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        {/*
          Status filter pills map to the lifecycle values documented above.
          'suspended' is included here for future use even though no customers
          currently have that status in the mock data.
        */}
        <FilterBar
          options={['all', 'active', 'new', 'inactive', 'suspended']}
          active={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      <AdminCard subtitle={`${filtered.length} customer${filtered.length !== 1 ? 's' : ''}`}>
        <AdminTable headers={['Customer', 'City', 'Orders', 'Total Spent', 'Joined', 'Last Order', 'Status']}>
          {filtered.map((c) => (
            <Tr key={c.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={c.name} />
                  <div>
                    <p className="font-semibold text-admin-navy">{c.name}</p>
                    <p className="text-[11px] text-admin-text-sub">{c.email}</p>
                  </div>
                </div>
              </Td>
              <Td>{c.city}</Td>
              <Td>{c.orders}</Td>
              <Td><span className="font-semibold">{formatCurrency(c.totalSpent)}</span></Td>
              <Td>{formatDate(c.joinedAt)}</Td>
              <Td>{c.lastOrder ? formatDate(c.lastOrder) : <span className="text-admin-text-sub">—</span>}</Td>
              {/* Status column — see top-of-file comment for full semantics */}
              <Td><StatusBadge status={c.status} /></Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
