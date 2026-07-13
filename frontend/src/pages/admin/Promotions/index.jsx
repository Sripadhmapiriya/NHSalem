import { useState } from 'react'
import { ADMIN_PROMOTIONS } from '@/mock/adminData'
import useProductStore from '@/store/productStore'
import useToastStore from '@/store/toastStore'
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
  formatDate,
} from '@/admin/AdminUI'

function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 mt-1 text-[11px] text-red-600">
      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>error</span>
      {message}
    </p>
  )
}

export default function AdminPromotions() {
  const { addToast } = useToastStore()
  const products = useProductStore((s) => s.products)

  const [promotions, setPromotions] = useState(ADMIN_PROMOTIONS)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Form states
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState('flat')
  const [formValue, setFormValue] = useState('')
  const [formMinOrder, setFormMinOrder] = useState(0)
  const [formDesc, setFormDesc] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formExpires, setFormExpires] = useState('')
  const [formLimit, setFormLimit] = useState('')
  const [formProducts, setFormProducts] = useState([]) // applicable product ids

  // Inline validation errors
  const [errors, setErrors] = useState({})

  const filtered = promotions.filter(
    (p) =>
      !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  )

  // ── Pause / Resume handler ──────────────────────────────────────────────────
  const handleToggleStatus = (promoId) => {
    setActionLoadingId(promoId)
    setTimeout(() => {
      setPromotions((prev) =>
        prev.map((p) => {
          if (p.id === promoId) {
            const next = p.status === 'active' ? 'paused' : 'active'
            return { ...p, status: next }
          }
          return p
        })
      )
      setActionLoadingId(null)
    }, 600)
  }

  // ── Open form for creating ──────────────────────────────────────────────────
  const handleNewPromo = () => {
    setEditingPromo(null)
    setFormCode('')
    setFormType('flat')
    setFormValue('')
    setFormMinOrder(0)
    setFormDesc('')
    setFormStartDate('')
    setFormExpires('')
    setFormLimit('')
    setFormProducts([])
    setErrors({})
    setShowForm(true)
  }

  // ── Open form for editing ───────────────────────────────────────────────────
  const handleEditClick = (promo) => {
    setEditingPromo(promo)
    setFormCode(promo.code)
    setFormType(promo.type)
    setFormValue(promo.value)
    setFormMinOrder(promo.minOrder)
    setFormDesc(promo.description)
    setFormStartDate(promo.startDate || '')
    setFormExpires(promo.expiresAt || '')
    setFormLimit(promo.limit || '')
    setFormProducts(promo.applicableProducts || [])
    setErrors({})
    setShowForm(true)
  }

  // ── Toggle applicable product ───────────────────────────────────────────────
  const toggleProduct = (productId) => {
    setFormProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  // ── Validate form ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!formCode.trim()) errs.code = 'Coupon code is required.'
    if (!formValue || Number(formValue) <= 0)
      errs.value = 'Discount value must be greater than 0.'
    if (formType === 'percent' && Number(formValue) > 100)
      errs.value = 'Percentage discount cannot exceed 100%.'
    if (!formDesc.trim()) errs.desc = 'Description is required.'
    if (formExpires && formStartDate && formExpires < formStartDate)
      errs.expires = 'Expiry date must be after the start date.'
    return errs
  }

  // ── Submit form ─────────────────────────────────────────────────────────────
  const handleFormSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)

    setTimeout(() => {
      if (editingPromo) {
        setPromotions((prev) =>
          prev.map((p) =>
            p.id === editingPromo.id
              ? {
                  ...p,
                  code: formCode.trim().toUpperCase(),
                  type: formType,
                  value: Number(formValue),
                  minOrder: Number(formMinOrder),
                  description: formDesc.trim(),
                  startDate: formStartDate || null,
                  expiresAt: formExpires || null,
                  limit: formLimit ? Number(formLimit) : null,
                  applicableProducts: formProducts,
                }
              : p
          )
        )
        addToast({ message: `Coupon "${formCode.toUpperCase()}" updated successfully.`, type: 'success' })
      } else {
        const newPromo = {
          id: `p${Date.now()}`,
          code: formCode.trim().toUpperCase(),
          type: formType,
          value: Number(formValue),
          minOrder: Number(formMinOrder),
          uses: 0,
          limit: formLimit ? Number(formLimit) : null,
          status: 'active',
          startDate: formStartDate || null,
          expiresAt: formExpires || null,
          description: formDesc.trim(),
          applicableProducts: formProducts,
        }
        setPromotions((prev) => [newPromo, ...prev])
        addToast({ message: `Coupon "${newPromo.code}" created successfully.`, type: 'success' })
      }
      setSubmitting(false)
      setShowForm(false)
      setEditingPromo(null)
    }, 800)
  }

  return (
    <AdminPage>
      {/* Inline Create/Edit Form */}
      {showForm && (
        <AdminCard
          title={editingPromo ? `Edit Coupon — ${editingPromo.code}` : 'New Coupon'}
          className="mb-6"
        >
          <form onSubmit={handleFormSubmit} className="p-5 space-y-5" noValidate>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Code */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Coupon Code <span className="text-admin-coral">*</span>
                </label>
                <input
                  placeholder="e.g. SAVE50"
                  value={formCode}
                  onChange={(e) => { setFormCode(e.target.value); setErrors((prev) => ({ ...prev, code: '' })) }}
                  className={`w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] uppercase focus:outline-none focus:border-admin-navy ${errors.code ? 'border-red-400' : 'border-admin-border'}`}
                />
                <FieldError message={errors.code} />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Type <span className="text-admin-coral">*</span>
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Discount Value <span className="text-admin-coral">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={formType === 'percent' ? 100 : undefined}
                  placeholder="e.g. 50"
                  value={formValue}
                  onChange={(e) => { setFormValue(e.target.value); setErrors((prev) => ({ ...prev, value: '' })) }}
                  className={`w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy ${errors.value ? 'border-red-400' : 'border-admin-border'}`}
                />
                <FieldError message={errors.value} />
              </div>

              {/* Min Order */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Min. Order (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0 = no minimum"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Description <span className="text-admin-coral">*</span>
                </label>
                <input
                  placeholder="Short description of coupon benefits"
                  value={formDesc}
                  onChange={(e) => { setFormDesc(e.target.value); setErrors((prev) => ({ ...prev, desc: '' })) }}
                  className={`w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy ${errors.desc ? 'border-red-400' : 'border-admin-border'}`}
                />
                <FieldError message={errors.desc} />
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Unlimited if empty"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                />
              </div>

              {/* Expires */}
              <div>
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                  Expires At
                </label>
                <input
                  type="date"
                  value={formExpires}
                  onChange={(e) => { setFormExpires(e.target.value); setErrors((prev) => ({ ...prev, expires: '' })) }}
                  className={`w-full px-3 py-2 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy ${errors.expires ? 'border-red-400' : 'border-admin-border'}`}
                />
                <FieldError message={errors.expires} />
              </div>
            </div>

            {/* Applicable Products */}
            <div>
              <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-2">
                Applicable Products
                <span className="ml-2 text-[10px] font-normal text-admin-text-sub normal-case tracking-normal">
                  (leave unchecked = applies to all products)
                </span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border cursor-pointer text-[12px] transition-all ${
                      formProducts.includes(p.id)
                        ? 'border-admin-navy bg-admin-navy/5 text-admin-navy font-semibold'
                        : 'border-admin-border text-admin-text-sub hover:border-admin-navy/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formProducts.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="accent-admin-navy flex-shrink-0"
                    />
                    <span className="truncate">{p.name}</span>
                  </label>
                ))}
              </div>
              {formProducts.length > 0 && (
                <p className="text-[11px] text-admin-navy mt-1.5 font-semibold">
                  {formProducts.length} product{formProducts.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <AdminBtn variant="secondary" onClick={() => setShowForm(false)}>Cancel</AdminBtn>
              <AdminBtn type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Saving…' : editingPromo ? 'Update Coupon' : 'Create Coupon'}
              </AdminBtn>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Filter / Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <AdminInput
          id="promo-search"
          placeholder="Search code or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          className="w-64"
        />
        <AdminBtn icon="add" onClick={handleNewPromo}>New Coupon</AdminBtn>
      </div>

      <AdminCard subtitle={`${filtered.length} promotions`}>
        <AdminTable headers={['Code', 'Type', 'Value', 'Min. Order', 'Uses', 'Status', 'Expires', 'Actions']}>
          {filtered.map((p) => (
            <Tr key={p.id}>
              <Td>
                <div>
                  <code className="font-bold text-admin-navy bg-admin-seafoam px-2 py-0.5 rounded text-[12px]">
                    {p.code}
                  </code>
                  <p className="text-[10px] text-admin-text-sub mt-0.5 max-w-[160px] truncate">{p.description}</p>
                </div>
              </Td>
              <Td className="capitalize">{p.type}</Td>
              <Td>
                <span className="font-semibold">
                  {p.type === 'flat' ? `₹${p.value}` : `${p.value}%`}
                </span>
              </Td>
              <Td>{p.minOrder > 0 ? `₹${p.minOrder}` : 'None'}</Td>
              <Td>
                <div>
                  <span className="font-semibold">{p.uses}</span>
                  {p.limit && <span className="text-admin-text-sub text-[11px]"> / {p.limit}</span>}
                </div>
              </Td>
              <Td><StatusBadge status={p.status} /></Td>
              <Td>{p.expiresAt ? formatDate(p.expiresAt) : <span className="text-admin-text-sub">—</span>}</Td>
              <Td>
                <div className="flex gap-1">
                  <AdminBtn size="sm" variant="secondary" icon="edit" onClick={() => handleEditClick(p)}>
                    Edit
                  </AdminBtn>
                  {p.status !== 'scheduled' && (
                    <AdminBtn
                      size="sm"
                      variant={p.status === 'active' ? 'secondary' : 'primary'}
                      disabled={actionLoadingId === p.id}
                      icon={p.status === 'active' ? 'pause' : 'play_arrow'}
                      onClick={() => handleToggleStatus(p.id)}
                    >
                      {actionLoadingId === p.id ? '…' : p.status === 'active' ? 'Pause' : 'Resume'}
                    </AdminBtn>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </AdminTable>
      </AdminCard>
    </AdminPage>
  )
}
