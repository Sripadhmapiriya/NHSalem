import { useEffect, useState } from 'react'
import { getCustomers } from '@/services/adminApi'
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

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await getCustomers()
        if (res.success) {
          setCustomers(res.customers)
        }
      } catch (err) {
        console.error('Failed to load customers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const filtered = customers.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCustomers = customers.length
  const activeCount = customers.filter((c) => c.status === 'active').length
  const avgSpend = totalCustomers > 0 
    ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers)
    : 0

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
        <FilterBar
          options={['all', 'active', 'new', 'inactive', 'suspended']}
          active={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      <AdminCard subtitle={`${filtered.length} customer${filtered.length !== 1 ? 's' : ''}`}>
        {loading ? (
          <div className="text-center py-10 font-semibold text-admin-navy">
            Loading customers...
          </div>
        ) : (
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
                <Td><StatusBadge status={c.status} /></Td>
              </Tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  )
}
