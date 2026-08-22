import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '@/components/ui/ConfirmModal'
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
  const [productToDelete, setProductToDelete] = useState(null)

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
        <AdminTable
          className="table-fixed"
          headers={[
            { label: 'Product', className: 'w-[28%] min-w-[200px]' },
            { label: 'Category', className: 'w-[10%] min-w-[100px] hidden xl:table-cell' },
            { label: 'Base Price', className: 'w-[10%] min-w-[90px]' },
            { label: 'Variants', className: 'w-[12%] min-w-[120px]' },
            { label: 'Rating', className: 'w-[10%] min-w-[100px] hidden xl:table-cell' },

            { label: 'Actions', className: 'w-[100px] sticky right-0 bg-white z-10 text-center shadow-[-4px_0_10px_rgba(0,0,0,0.02)]' }
          ]}
        >
          {paginated.map((p) => (
            <Tr key={p.id} className="h-[72px]" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
              <Td className="p-0">
                <div className="flex items-center gap-3 px-4 py-2">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-[8px] object-cover border border-admin-border/50 shrink-0" />
                    : <div className="w-10 h-10 rounded-[8px] bg-admin-seafoam border border-admin-border/50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '20px' }}>image</span></div>
                  }
                  <div className="flex flex-col overflow-hidden">
                    <p className="font-semibold text-admin-navy truncate max-w-[180px]" title={p.name}>{p.name}</p>
                    {/* Fallback for category/rating on narrow screens */}
                    <div className="flex items-center gap-1.5 xl:hidden mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      <span className="text-[10px] text-admin-text-sub capitalize">{CATEGORY_MAP[p.category] || p.category}</span>
                      {p.reviewCount > 0 && (
                        <span className="text-[10px] text-admin-text-sub flex items-center gap-0.5">
                           • <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '10px', fontVariationSettings: "'FILL' 1" }}>star</span> {p.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Td>
              <Td className="capitalize hidden xl:table-cell">{CATEGORY_MAP[p.category] || p.category}</Td>
              <Td><span className="font-bold">{formatCurrency(p.variants?.[0]?.onlinePrice || 0)}</span></Td>
              <Td>
                {p.variants?.length > 0 ? (
                  <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                    <span className="text-[11px] text-admin-text truncate max-w-[110px]" title={p.variants.map(v => v.label).join(', ')}>
                      {p.variants.map(v => v.label).join(', ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-admin-text-sub">
                    {p.unit || '500g'}
                  </span>
                )}
              </Td>
              <Td className="hidden xl:table-cell">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {p.reviewCount > 0 ? (
                    <>
                      <span className="material-symbols-outlined text-admin-gold" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{p.rating} <span className="text-admin-text-sub text-[11px]">({p.reviewCount?.toLocaleString()})</span></span>
                    </>
                  ) : (
                    <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">New</span>
                  )}
                </div>
              </Td>

              <Td className="w-[100px] sticky right-0 bg-white z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] p-0 border-l border-admin-border/30">
                <div className="flex items-center justify-center gap-2 h-full px-2">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-admin-navy hover:bg-admin-seafoam border border-transparent hover:border-admin-border transition-all"
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`) }}
                    title="Edit"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                  </button>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-admin-coral hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductToDelete(p);
                    }}
                    title="Delete"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
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

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        onConfirm={() => {
          if (productToDelete) {
            useProductStore.getState().deleteProduct(productToDelete.id)
            setProductToDelete(null)
          }
        }}
      />
    </AdminPage>
  )
}
