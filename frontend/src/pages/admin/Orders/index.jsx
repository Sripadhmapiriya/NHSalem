import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_ORDERS } from '@/mock/adminData'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, AdminInput, FilterBar, formatCurrency, formatDate } from '@/admin/AdminUI'

const ALL_STATUSES = ['all', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrders() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = ADMIN_ORDERS.filter((o) => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <AdminPage>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <AdminInput
          id="orders-search"
          placeholder="Search order ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        <FilterBar
          options={ALL_STATUSES}
          active={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      <AdminCard subtitle={`${filtered.length} order${filtered.length !== 1 ? 's' : ''}`}>
        <AdminTable headers={['Order ID', 'Customer', 'City', 'Items', 'Payment', 'Total', 'Date', 'Status', '']}>
          {filtered.map((o) => (
            <Tr key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)}>
              <Td><span className="font-mono font-bold text-admin-navy text-[12px]">{o.id}</span></Td>
              <Td>
                <div>
                  <p className="font-semibold">{o.customer.name}</p>
                  <p className="text-[11px] text-admin-text-sub">{o.customer.email}</p>
                </div>
              </Td>
              <Td>{o.city}</Td>
              <Td>{o.items}</Td>
              <Td>
                <div>
                  <p>{o.paymentMethod}</p>
                  <StatusBadge status={o.paymentStatus} />
                </div>
              </Td>
              <Td><span className="font-bold">{formatCurrency(o.total)}</span></Td>
              <Td><span className="text-[12px]">{formatDate(o.placedAt)}</span></Td>
              <Td><StatusBadge status={o.status} /></Td>
              <Td>
                <AdminBtn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${o.id}`) }}>
                  View
                </AdminBtn>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
