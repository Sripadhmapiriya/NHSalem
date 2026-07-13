import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useProductStore from '@/store/productStore'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminBtn } from '@/admin/AdminUI'

const CATEGORIES = ['fish', 'prawns-shrimp', 'crabs', 'lobster']

const ALL_BADGES = [
  { type: 'fresh', label: 'Fresh Today' },
  { type: 'hot', label: 'HOT DEAL' },
  { type: 'new', label: 'New Catch' },
  { type: 'premium', label: 'Premium' },
  { type: 'limited', label: 'LIMITED TIME' },
]

export default function AdminAddEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const { addProduct, updateProduct, getProduct, fetchProducts, products } = useProductStore()

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  const existing = isNew ? null : getProduct(id)

  const [selectedBadges, setSelectedBadges] = useState(
    existing?.badges?.map((b) => b.type) || []
  )
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: existing
      ? {
          name:           existing.name,
          tagline:        existing.tagline,
          description:    existing.description,
          category:       existing.category,
          basePrice:      existing.basePrice,
          freshnessScore: existing.freshnessScore,
          catchTime:      existing.catchTime,
          howToCook:      existing.howToCook,
          image:          existing.image,
        }
      : { category: 'fish', freshnessScore: 90 },
  })

  // Re-run setSelectedBadges when existing changes/loads
  useEffect(() => {
    if (existing?.badges) {
      setSelectedBadges(existing.badges.map(b => b.type))
    }
  }, [existing])

  if (!isNew && !existing) {
    return (
      <AdminPage>
        <div className="text-center py-10 font-semibold text-admin-navy">
          Loading product...
        </div>
      </AdminPage>
    )
  }

  const toggleBadge = (type) => {
    setSelectedBadges((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const onSubmit = (data) => {
    setSaving(true)

    // Map selected badge types back to { type, label }
    const badges = selectedBadges.map((type) => {
      const found = ALL_BADGES.find((ab) => ab.type === type)
      return { type, label: found?.label ?? type }
    })

    const payload = { ...data, badges }

    // Simulate async save (replace setTimeout with real API call in Phase 2)
    setTimeout(() => {
      try {
        if (isNew) {
          addProduct(payload)
          addToast({ message: 'Product created successfully!', type: 'success' })
        } else {
          updateProduct(id, payload)
          addToast({ message: 'Product updated successfully!', type: 'success' })
        }
        setSaving(false)
        navigate('/admin/products')
      } catch {
        setSaving(false)
        addToast({ message: 'Failed to save product. Please try again.', type: 'error' })
      }
    }, 800)
  }

  // If editing a non-existent product id, redirect gracefully
  if (!isNew && !existing) {
    return (
      <AdminPage>
        <div className="text-center py-20 text-admin-text-sub">
          <span className="material-symbols-outlined mb-2" style={{ fontSize: '40px' }}>inventory_2</span>
          <p className="text-sm font-medium">Product not found.</p>
          <AdminBtn className="mt-4" onClick={() => navigate('/admin/products')}>Back to Products</AdminBtn>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage
      back={
        <AdminBtn
          variant="secondary"
          icon="arrow_back"
          onClick={() => {
            if (isDirty && !window.confirm('Discard unsaved changes?')) return
            navigate('/admin/products')
          }}
        >
          Back
        </AdminBtn>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">
            <AdminCard title={isNew ? 'New Product' : `Edit — ${existing?.name ?? id}`}>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Product Name <span className="text-admin-coral">*</span>
                    </label>
                    <input
                      {...register('name', { required: 'Product name is required' })}
                      placeholder="e.g. Jumbo Tiger Prawns"
                      className={`w-full px-3 py-2.5 rounded-[10px] border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-navy/10 ${errors.name ? 'border-admin-coral' : 'border-admin-border focus:border-admin-navy'}`}
                    />
                    {errors.name && <p className="text-[11px] text-admin-coral mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Tagline */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Tagline</label>
                    <input
                      {...register('tagline')}
                      placeholder="Short one-liner for the product"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Category <span className="text-admin-coral">*</span>
                    </label>
                    <select
                      {...register('category', { required: true })}
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy capitalize"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace('-', ' & ')}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base Price */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Base Price (₹) <span className="text-admin-coral">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      {...register('basePrice', {
                        required: 'Base price is required',
                        valueAsNumber: true,
                        min: { value: 1, message: 'Price must be greater than 0' },
                      })}
                      className={`w-full px-3 py-2.5 rounded-[10px] border bg-admin-seafoam text-[13px] focus:outline-none ${errors.basePrice ? 'border-admin-coral' : 'border-admin-border focus:border-admin-navy'}`}
                    />
                    {errors.basePrice && <p className="text-[11px] text-admin-coral mt-1">{errors.basePrice.message}</p>}
                  </div>

                  {/* Freshness Score */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Freshness Score (0–100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      {...register('freshnessScore', { valueAsNumber: true })}
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>

                  {/* Catch Time */}
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Catch Time</label>
                    <input
                      {...register('catchTime')}
                      placeholder="e.g. 4h ago"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Full product description…"
                    className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy resize-none"
                  />
                </div>

                {/* How to Cook */}
                <div>
                  <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">How to Cook</label>
                  <textarea
                    {...register('howToCook')}
                    rows={3}
                    placeholder="Cooking instructions…"
                    className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy resize-none"
                  />
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Image */}
            <AdminCard title="Image">
              <div className="p-4">
                {existing?.image && (
                  <img src={existing.image} alt="" className="w-full h-36 object-cover rounded-[10px] border border-admin-border mb-3" />
                )}
                <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
                <input
                  {...register('image')}
                  placeholder="https://…"
                  className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                />
              </div>
            </AdminCard>

            {/* Badges */}
            <AdminCard title="Badges">
              <div className="p-4 flex flex-wrap gap-2">
                {ALL_BADGES.map((b) => {
                  const isSelected = selectedBadges.includes(b.type)
                  return (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => toggleBadge(b.type)}
                      style={
                        isSelected
                          ? { backgroundColor: '#0B1E3D', color: '#ffffff', borderColor: '#0B1E3D' }
                          : { backgroundColor: '#ffffff', color: '#4A5568', borderColor: '#D1DAE3' }
                      }
                      className="px-3 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer capitalize transition-all select-none hover:opacity-90"
                    >
                      {b.label}
                    </button>
                  )
                })}
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white border-t border-admin-border/60 px-5 py-4 flex items-center justify-between z-20 shadow-[0_-4px_12px_rgba(11,30,61,0.04)] rounded-t-[16px]">
          <div>
            {isDirty && (
              <p className="text-[12px] text-admin-gold font-bold flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                Unsaved changes
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <AdminBtn
              variant="secondary"
              onClick={() => {
                if (isDirty && !window.confirm('Discard unsaved changes?')) return
                navigate('/admin/products')
              }}
            >
              Cancel
            </AdminBtn>
            <AdminBtn
              type="submit"
              variant="primary"
              disabled={saving}
              icon={saving ? 'sync' : 'save'}
            >
              {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
            </AdminBtn>
          </div>
        </div>
      </form>
    </AdminPage>
  )
}
