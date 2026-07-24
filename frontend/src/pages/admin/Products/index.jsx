import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useProductStore from '@/store/productStore'
import {
  AdminPage,
  AdminCard,
  AdminTable,
  Tr,
  Td,
  StatusBadge,
  AdminBtn,
  AdminInput,
  FilterBar,
  formatCurrency,
  Pagination,
} from '@/admin/AdminUI'

const CATEGORIES = ['all', 'fish', 'prawns-shrimp', 'crabs', 'lobster', 'dried-fish', 'combos']

const CATEGORY_MAP = {
  'all': 'All',
  'fish': 'Fish',
  'prawns-shrimp': 'Prawns & Shrimp',
  'crabs': 'Crabs',
  'lobster': 'Lobster',
  'dried-fish': 'Dried Fish',
  'combos': 'Combos'
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const products = useProductStore((s) => s.products)
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, category])

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || p.category === category
    return matchSearch && matchCat
  })

  // Sort products alphabetically A-Z by name
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name))

  // Paginate products
  const paginated = sorted.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <AdminPage>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <AdminInput
            id="products-search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon="search"
            className="w-64"
          />
          <FilterBar
            options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_MAP[c] || c }))}
            active={category}
            onSelect={setCategory}
          />
        </div>
        <AdminBtn icon="add" onClick={() => navigate('/admin/products/new')}>
          Add Product
        </AdminBtn>
      </div>

      <AdminCard subtitle={`${sorted.length} products`}>
        <AdminTable headers={[
          { label: 'Product', className: 'sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]' }, 
          'Category', 
          'Base Price', 
          'Rating', 
          'Freshness (0-100)', 
          'Badges', 
          'Actions'
        ]}>
          {paginated.map((p) => (
            <Tr key={p.id} onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
              <Td className="sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] p-0">
                <div className="flex items-center gap-3 px-4 py-2.5">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-[8px] object-cover border border-admin-border/50 shrink-0" />
                    : <div className="w-10 h-10 rounded-[8px] bg-admin-seafoam border border-admin-border/50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '20px' }}>image</span></div>
                  }
                  <p className="font-semibold text-admin-navy truncate max-w-[150px] md:max-w-[200px]" title={p.name}>{p.name}</p>
                </div>
              </Td>
              <Td className="capitalize">{CATEGORY_MAP[p.category] || p.category}</Td>
              <Td><span className="font-bold">{formatCurrency(p.basePrice)}</span></Td>
              <Td>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  {p.reviewCount > 0 ? (
                    <span>{p.rating} <span className="text-admin-text-sub text-[11px]">({p.reviewCount?.toLocaleString()})</span></span>
                  ) : (
                    <span className="text-admin-text-sub italic" title="No ratings">—</span>
                  )}
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="h-1.5 w-20 bg-admin-border rounded-full overflow-hidden shrink-0">
                    <div className="h-full bg-admin-success rounded-full" style={{ width: `${Math.max(0, Math.min(100, p.freshnessScore ?? 0))}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold min-w-[24px]">{p.freshnessScore ?? '—'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1 min-w-[100px]">
                  {p.badges?.map((b) => {
                    const isFlagged = b.type === 'hot'
                    const isPaid = b.type === 'paid' || b.label?.toLowerCase() === 'paid'
                    const isNew = b.type === 'new'
                    const status = isFlagged ? 'flagged' : isPaid ? 'paid' : isNew ? 'new' : 'active'
                    const tooltip = isFlagged ? 'Flagged products can remain active pending review.' : isPaid ? 'Paid Promotion' : ''
                    return (
                      <span key={b.type} title={tooltip}>
                        <StatusBadge status={status} />
                      </span>
                    )
                  })}
                </div>
              </Td>
              <Td className="w-auto">
                <div className="flex gap-2 justify-end">
                  <AdminBtn
                    size="sm"
                    variant="secondary"
                    icon="edit"
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`) }}
                  >
                    Edit
                  </AdminBtn>
                  <AdminBtn
                    size="sm"
                    variant="danger"
                    icon="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        useProductStore.getState().deleteProduct(p.id)
                      }
                    }}
                  >
                    Delete
                  </AdminBtn>
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
        <Pagination
          currentPage={currentPage}
          totalItems={sorted.length}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />
      </AdminCard>
    </AdminPage>
  )
}
