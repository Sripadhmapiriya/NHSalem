import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminOrders, acceptAdminOrder } from '@/services/adminApi'
import { AdminPage, AdminCard, AdminTable, Tr, Td, StatusBadge, AdminBtn, AdminInput, FilterBar, formatCurrency, formatDate, Pagination } from '@/admin/AdminUI'
import { SeafoodLoader } from '@/components/ui'
import useToastStore from '@/store/toastStore'

const ALL_STATUSES = ['all', 'confirmed', 'accepted', 'packed', 'out_for_delivery', 'delivered', 'cancelled']

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const { addToast } = useToastStore()

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

  // Handle auto-accept from email link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const acceptId = params.get('accept')
    if (acceptId) {
      navigate('/admin/orders', { replace: true })
      
      const performAutoAccept = async () => {
        try {
          const res = await acceptAdminOrder(acceptId)
          if (res.success) {
            addToast({ message: 'Order accepted — confirmation email sent to customer', type: 'success' })
            const updated = await getAdminOrders()
            if (updated.success) setOrders(updated.orders)
          }
        } catch (err) {
          addToast({ message: err.message || 'Failed to auto-accept order', type: 'error' })
        }
      }
      performAutoAccept()
    }
  }, [navigate, addToast])

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const filtered = orders.filter((o) => {
    const customerName = o.address?.name || ''
    const matchSearch = 
      !search || 
      o.id.toLowerCase().includes(search.toLowerCase()) || 
      customerName.toLowerCase().includes(search.toLowerCase())
    
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  // Paginate orders
  const paginated = filtered.slice((currentPage - 1) * 10, currentPage * 10)

  const handleAccept = async (e, dbId) => {
    e.stopPropagation()
    try {
      const res = await acceptAdminOrder(dbId)
      if (res.success) {
        setOrders(prev => prev.map(o => o.dbId === dbId ? { ...o, status: 'accepted' } : o))
        addToast({ message: 'Order accepted — confirmation email sent to customer', type: 'success' })
      }
    } catch (err) {
      addToast({ message: err.message || 'Failed to accept order', type: 'error' })
    }
  }

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
          <>
            <AdminTable headers={['Order ID', 'Customer', 'City', 'Items', 'Payment', 'Total', 'Date', 'Status', '']}>
              {paginated.map((o) => {
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
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <AdminBtn size="sm" variant="secondary" onClick={() => navigate(`/admin/orders/${o.dbId}`)}>
                          View
                        </AdminBtn>
                        {o.status === 'confirmed' && (
                          <AdminBtn size="sm" variant="primary" style={{ backgroundColor: '#166534' }} onClick={(e) => handleAccept(e, o.dbId)}>
                            Accept
                          </AdminBtn>
                        )}
                      </div>
                    </Td>
                  </Tr>
                )
              })}
            </AdminTable>
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={10}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </AdminCard>
    </AdminPage>
  )
}
