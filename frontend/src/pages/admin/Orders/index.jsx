import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminOrders } from '@/services/adminApi'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, AdminInput, FilterBar, formatCurrency, formatDate } from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'

const ALL_STATUSES = ['all', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await getAdminOrders()
        if (res.success) {
          setOrders(res.orders)
        }
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const filtered = orders.filter((o) => {
    const customerName = o.address?.name || ''
    const matchSearch = 
      !search || 
      o.id.toLowerCase().includes(search.toLowerCase()) || 
      customerName.toLowerCase().includes(search.toLowerCase())
    
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
        {loading ? (
          <SeafoodLoader text="Loading orders..." className="py-8" />
        ) : (
          <AdminTable headers={['Order ID', 'Customer', 'City', 'Items', 'Payment', 'Total', 'Date', 'Status', '']}>
            {filtered.map((o) => {
              const itemCount = o.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
              return (
                <Tr key={o.dbId} onClick={() => navigate(`/admin/orders/${o.dbId}`)}>
                  <Td><span className="font-mono font-bold text-admin-navy text-[12px]">{o.id}</span></Td>
                  <Td>
                    <div>
                      <p className="font-semibold">{o.address?.name || 'Customer'}</p>
                      <p className="text-[11px] text-admin-text-sub">{o.address?.email || ''}</p>
                    </div>
                  </Td>
                  <Td>{o.address?.city || ''}</Td>
                  <Td>{itemCount}</Td>
                  <Td>
                    <div>
                      <p className="capitalize">{o.paymentMethod}</p>
                      <StatusBadge status={o.paymentStatus} />
                    </div>
                  </Td>
                  <Td><span className="font-bold">{formatCurrency(o.total)}</span></Td>
                  <Td><span className="text-[12px]">{formatDate(o.placedAt)}</span></Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td>
                    <AdminBtn size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${o.dbId}`) }}>
                      View
                    </AdminBtn>
                  </Td>
                </Tr>
              )
            })}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  )
}
