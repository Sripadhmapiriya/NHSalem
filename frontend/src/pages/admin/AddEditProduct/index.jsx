import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import useProductStore from '@/store/productStore'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminBtn } from '@/admin/AdminUI'
import { uploadAdminImage } from '@/services/adminApi'

const CATEGORIES = ['fish', 'prawns-shrimp', 'crabs', 'lobster', 'dried-fish', 'combos']

const CATEGORY_LABELS = {
  'fish': 'Fish',
  'prawns-shrimp': 'Prawns & Shrimp',
  'crabs': 'Crabs',
  'lobster': 'Lobster',
  'dried-fish': 'Dried Fish',
  'combos': 'Combos'
}

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
  const [imageUploadMode, setImageUploadMode] = useState('url')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Variants state management
  const [variants, setVariants] = useState(existing?.variants || existing?.weights || [])
  const [newVarLabel, setNewVarLabel] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [newVarPrice, setNewVarPrice] = useState('')
  const [newVarOrigPrice, setNewVarOrigPrice] = useState('')

  const handleAddVariant = () => {
    if (!newVarLabel.trim()) {
      addToast({ message: 'Variant label is required', type: 'warning' })
      return
    }
    if (!newVarPrice.trim()) {
      addToast({ message: 'Variant price is required', type: 'warning' })
      return
    }
    const newVar = {
      label: newVarLabel.trim(),
      value: newVarValue ? Number(newVarValue) : undefined,
      price: Number(newVarPrice),
      originalPrice: newVarOrigPrice ? Number(newVarOrigPrice) : undefined
    }
    setVariants([...variants, newVar])
    setNewVarLabel('')
    setNewVarValue('')
    setNewVarPrice('')
    setNewVarOrigPrice('')
  }

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (existing) {
      setVariants(existing.variants || existing.weights || [])
    }
  }, [existing])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: existing
      ? {
          name:           existing.name,
          localName:      existing.localName,
          tagline:        existing.tagline,
          description:    existing.description,
          category:       existing.category,
          basePrice:      existing.basePrice,
          freshnessScore: existing.freshnessScore,
          catchTime:      existing.catchTime,
          howToCook:      existing.howToCook,
          image:          existing.image,
          stockStatus:    existing.stockStatus || 'in_stock',
        }
      : { category: 'fish', freshnessScore: 90, stockStatus: 'in_stock' },
  })

  const currentImage = useWatch({ control, name: 'image' })

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

  const onSubmit = async (data) => {
    setSaving(true)

    // Map selected badge types back to { type, label }
    const badges = selectedBadges.map((type) => {
      const found = ALL_BADGES.find((ab) => ab.type === type)
      return { type, label: found?.label ?? type }
    })

    const payload = {
      ...data,
      badges,
      weights: variants,
      variants: variants
    }

    try {
      if (isNew) {
        await addProduct(payload)
        addToast({ message: 'Product created successfully!', type: 'success' })
      } else {
        await updateProduct(id, payload)
        addToast({ message: 'Product updated successfully!', type: 'success' })
      }
      navigate('/admin/products')
    } catch (err) {
      addToast({ message: err.message || 'Failed to save product. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
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

                  {/* Local/Regional Name */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Local/Regional Name
                    </label>
                    <input
                      {...register('localName')}
                      placeholder="e.g. Vanjaram"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy"
                    />
                  </div>

                  {/* Stock Status */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
                      Stock Status <span className="text-admin-coral">*</span>
                    </label>
                    <select
                      {...register('stockStatus', { required: true })}
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:border-admin-navy"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
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
                        <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
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

            {/* Product Variants */}
            <AdminCard title="Product Variants">
              <div className="p-5 space-y-4">
                <p className="text-[12px] text-admin-text-sub">
                  Define different options for this product (e.g. label: "1 piece (~600g)", price: ₹699, originalPrice: ₹799).
                  If no variants are defined, the product card will fall back to the default unit and base price.
                </p>

                {/* Add Variant Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-admin-seafoam/50 p-4 rounded-[12px] border border-admin-border/50 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-admin-text uppercase tracking-[0.05em] mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={newVarLabel}
                      onChange={(e) => setNewVarLabel(e.target.value)}
                      placeholder="e.g. 500g, 1kg, 1 piece (~600g)"
                      className="w-full px-2.5 py-2 rounded-[8px] border border-admin-border bg-white text-[12px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-admin-text uppercase tracking-[0.05em] mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newVarPrice}
                      onChange={(e) => setNewVarPrice(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full px-2.5 py-2 rounded-[8px] border border-admin-border bg-white text-[12px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-admin-text uppercase tracking-[0.05em] mb-1">
                      Original Price (₹ - Optional)
                    </label>
                    <input
                      type="number"
                      value={newVarOrigPrice}
                      onChange={(e) => setNewVarOrigPrice(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-2.5 py-2 rounded-[8px] border border-admin-border bg-white text-[12px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="h-9 px-4 rounded-[8px] bg-admin-navy text-white text-[12px] font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    Add Variant
                  </button>
                </div>

                {/* Variants List */}
                {variants.length > 0 ? (
                  <div className="border border-admin-border/60 rounded-[12px] overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-admin-seafoam text-[11px] font-bold text-admin-text uppercase tracking-wider border-b border-admin-border/60">
                          <th className="px-4 py-2.5">Label</th>
                          <th className="px-4 py-2.5">Price</th>
                          <th className="px-4 py-2.5">Original Price</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-admin-border/40 text-[12px] text-admin-text">
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-admin-seafoam/20">
                            <td className="px-4 py-2.5 font-semibold">{v.label}</td>
                            <td className="px-4 py-2.5">₹{v.price}</td>
                            <td className="px-4 py-2.5 text-admin-text-sub">
                              {v.originalPrice ? `₹${v.originalPrice}` : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(idx)}
                                className="text-admin-coral hover:underline font-semibold flex items-center gap-0.5 ml-auto cursor-pointer"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-admin-text-sub border border-dashed border-admin-border rounded-[12px] bg-admin-seafoam/20">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>inventory</span>
                    <p className="text-[11px] mt-1">No variants added yet. Using default unit and price.</p>
                  </div>
                )}
              </div>
            </AdminCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Image */}
            <AdminCard title="Image">
              <div className="p-4">
                <div className="mb-4">
                  {currentImage ? (
                    <img src={currentImage} alt="Preview" className="w-full h-40 object-cover rounded-[10px] border border-admin-border" />
                  ) : (
                    <div className="w-full h-40 bg-admin-seafoam border border-admin-border border-dashed rounded-[10px] flex items-center justify-center text-admin-text-sub">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4 bg-admin-seafoam/50 p-1 rounded-full border border-admin-border/50">
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('url')}
                    className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${imageUploadMode === 'url' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMode('upload')}
                    className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${imageUploadMode === 'upload' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}
                  >
                    Upload
                  </button>
                </div>

                {imageUploadMode === 'url' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
                    <input
                      {...register('image')}
                      placeholder="https://…"
                      className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Choose File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        setUploadingImage(true)
                        try {
                          const res = await uploadAdminImage(file)
                          if (res.success) {
                            setValue('image', res.url, { shouldDirty: true })
                            addToast({ message: 'Image uploaded successfully!', type: 'success' })
                          } else {
                            addToast({ message: 'Failed to upload image', type: 'error' })
                          }
                        } catch (err) {
                          addToast({ message: err.message, type: 'error' })
                        } finally {
                          setUploadingImage(false)
                        }
                      }}
                      className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-admin-navy file:text-white hover:file:bg-admin-navy/90 focus:outline-none cursor-pointer"
                    />
                    {uploadingImage && <p className="text-[11px] text-admin-gold mt-2 font-bold animate-pulse">Uploading...</p>}
                    <input type="hidden" {...register('image')} />
                  </div>
                )}
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
