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
        <AdminTable headers={['', 'Name', 'Category', 'Base Price', 'Rating', 'Reviews', 'Freshness', 'Badges', '']}>
          {paginated.map((p) => (
            <Tr key={p.id} onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
              <Td>
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-[10px] object-cover border border-admin-border/50" />
                  : <div className="w-12 h-12 rounded-[10px] bg-admin-seafoam border border-admin-border/50 flex items-center justify-center"><span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '20px' }}>image</span></div>
                }
              </Td>
              <Td>
                <div>
                  <p className="font-semibold text-admin-navy">{p.name}</p>
                  <p className="text-[11px] text-admin-text-sub">{p.tagline}</p>
                </div>
              </Td>
              <Td className="capitalize">{CATEGORY_MAP[p.category] || p.category}</Td>
              <Td><span className="font-bold">{formatCurrency(p.basePrice)}</span></Td>
              <Td>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  {p.rating ?? '—'}
                </span>
              </Td>
              <Td>{p.reviewCount?.toLocaleString() ?? '0'}</Td>
              <Td>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-16 bg-admin-border rounded-full overflow-hidden">
                    <div className="h-full bg-admin-success rounded-full" style={{ width: `${p.freshnessScore ?? 0}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold">{p.freshnessScore ?? '—'}</span>
                </div>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {p.badges?.map((b) => (
                    <StatusBadge
                      key={b.type}
                      status={b.type === 'hot' ? 'flagged' : b.type === 'fresh' ? 'active' : b.type === 'new' ? 'new' : 'paid'}
                    />
                  ))}
                </div>
              </Td>
              <Td>
                <div className="flex gap-1">
                  <AdminBtn
                    size="sm"
                    variant="secondary"
                    icon="edit"
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`) }}
                  >
                    Edit
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
