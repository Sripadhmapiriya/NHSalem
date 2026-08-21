import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useWatch, Controller } from 'react-hook-form'
import useProductStore from '@/store/productStore'
import useToastStore from '@/store/toastStore'
import { AdminPage, AdminCard, AdminBtn } from '@/admin/AdminUI'
import { useAdminConfirm } from '@/admin/useAdminConfirm'
import { uploadAdminImage, getThumbnailLibrary } from '@/services/adminApi'

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

const PREDEFINED_PRODUCTS = [
  { en: "Leather Jacket", ta: "கிளாத்தி" },
  { en: "Koduvai (Boneless) / Barramundi", ta: "கொடுவா (Boneless)" },
  { en: "Vanjaram - Round Cut / Seer Fish", ta: "வஞ்சிரம் - ரவுண்ட் கட்" },
  { en: "Anchovy", ta: "நெத்திலி" },
  { en: "Grouper", ta: "கலவை" },
  { en: "Squid Rings", ta: "கணவா" },
  { en: "Basa Fillet", ta: "பாசா ஃபில்லெட்" },
  { en: "Sardine", ta: "மத்தி" },
  { en: "Red Snapper", ta: "சங்கரா" },
  { en: "Tiger Prawn", ta: "டைகர் இறால்" },
  { en: "Prawn", ta: "இறால்" },
  { en: "Crab", ta: "நண்டு" },
  { en: "Lobster", ta: "லாப்ஸ்டர்" }
]

const CustomComboBox = ({ label, placeholder, options, value, onChange, error, required }) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '')
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(inputValue.toLowerCase()))

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
        {label} {required && <span className="text-admin-coral">*</span>}
      </label>
      <div className="relative">
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 rounded-[10px] border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-navy/10 pr-10 ${error ? 'border-admin-coral' : 'border-admin-border focus:border-admin-navy'}`}
        />
        <button type="button" onClick={() => setOpen(!open)} className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-sub focus:outline-none flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_drop_down</span>
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-admin-border/50 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-2">
          {filtered.map(opt => (
            <div
              key={opt}
              className="px-4 py-2.5 text-[13px] text-admin-text hover:bg-admin-seafoam hover:text-admin-navy font-medium cursor-pointer transition-colors"
              onClick={() => {
                setInputValue(opt)
                onChange(opt)
                setOpen(false)
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-admin-coral mt-1.5">{error.message}</p>}
    </div>
  )
}

const CustomSelect = ({ label, options, value, onChange, error, required }) => {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = options.find(o => o.value === value)

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">
        {label} {required && <span className="text-admin-coral">*</span>}
      </label>
      <div
        className={`relative w-full px-3 py-2.5 rounded-[10px] border bg-admin-seafoam text-[13px] text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-navy/10 pr-10 cursor-pointer select-none ${error ? 'border-admin-coral' : 'border-admin-border hover:border-admin-navy'}`}
        onClick={() => setOpen(!open)}
      >
        <span className={currentOption ? '' : 'text-admin-text-sub'}>
          {currentOption ? currentOption.label : 'Select...'}
        </span>
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-sub focus:outline-none flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_drop_down</span>
        </button>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-admin-border/50 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto py-2">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 text-[13px] hover:bg-admin-seafoam hover:text-admin-navy font-medium cursor-pointer transition-colors ${value === opt.value ? 'bg-admin-navy/5 text-admin-navy' : 'text-admin-text'}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-[11px] text-admin-coral mt-1.5">{error.message}</p>}
    </div>
  )
}

export default function AdminAddEditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const { addProduct, updateProduct, getProduct, fetchProducts, products } = useProductStore()
  const { confirm, ConfirmModal } = useAdminConfirm()

  const isNew = !id || id === 'new'

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
    }
  }, [products.length, fetchProducts])

  const [thumbnailLibrary, setThumbnailLibrary] = useState({})
  
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await getThumbnailLibrary()
        if (res.success && res.thumbnails) {
          setThumbnailLibrary(res.thumbnails)
        }
      } catch (err) {
        console.error('Failed to load thumbnail library:', err)
      }
    }
    fetchLibrary()
  }, [])

  const existing = isNew ? null : getProduct(id)

  const [selectedBadges, setSelectedBadges] = useState(
    existing?.badges?.map((b) => b.type) || []
  )
  const [saving, setSaving] = useState(false)
  const [thumbUploadMode, setThumbUploadMode] = useState('url')
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [localPreviewThumb, setLocalPreviewThumb] = useState(null)
  const [imageErrorThumb, setImageErrorThumb] = useState(false)

  const [image1UploadMode, setImage1UploadMode] = useState('url')
  const [uploadingImage1, setUploadingImage1] = useState(false)
  const [localPreview1, setLocalPreview1] = useState(null)
  const [imageError1, setImageError1] = useState(false)

  const [image2UploadMode, setImage2UploadMode] = useState('url')
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [localPreview2, setLocalPreview2] = useState(null)
  const [imageError2, setImageError2] = useState(false)

  // Variants state management
  const [variants, setVariants] = useState(existing?.variants || existing?.weights || [])
  const [newVarLabel, setNewVarLabel] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  const [newVarOnlinePrice, setNewVarOnlinePrice] = useState('')
  const [newVarMrp, setNewVarMrp] = useState('')

  const handleAddVariant = () => {
    if (!newVarLabel.trim()) {
      addToast({ message: 'Variant label is required', type: 'warning' })
      return
    }
    if (!newVarOnlinePrice.trim() || !newVarMrp.trim()) {
      addToast({ message: 'Both MRP and Online Price are required', type: 'warning' })
      return
    }
    if (Number(newVarOnlinePrice) > Number(newVarMrp)) {
      addToast({ message: 'Online Price cannot be greater than MRP', type: 'warning' })
      return
    }
    const newVar = {
      label: newVarLabel.trim(),
      value: newVarValue ? Number(newVarValue) : undefined,
      onlinePrice: Number(newVarOnlinePrice),
      mrp: Number(newVarMrp)
    }
    setVariants([...variants, newVar])
    setNewVarLabel('')
    setNewVarValue('')
    setNewVarOnlinePrice('')
    setNewVarMrp('')
  }

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { isDirty, errors },
  } = useForm({
    defaultValues: existing
      ? {
        name: existing.name,
        localName: existing.localName,
        tagline: existing.tagline,
        description: existing.description,
        category: existing.category,
        catchTime: existing.catchTime,
        howToCook: existing.howToCook,
        gallery_image_1: existing.gallery_image_1,
        gallery_image_2: existing.gallery_image_2,
        image: existing.image,
        stockStatus: existing.stockStatus || 'in_stock',
      }
      : { category: 'fish', stockStatus: 'in_stock' },
  })

  useEffect(() => {
    if (existing) {
      setVariants(existing.variants || existing.weights || [])
      reset({
        name: existing.name || '',
        localName: existing.localName || '',
        tagline: existing.tagline || '',
        description: existing.description || '',
        category: existing.category || 'fish',
        catchTime: existing.catchTime || '',
        howToCook: existing.howToCook || '',
        gallery_image_1: existing.gallery_image_1 || '',
        gallery_image_2: existing.gallery_image_2 || '',
        image: existing.image || '',
        stockStatus: existing.stockStatus || 'in_stock',
      })
    } else {
      setVariants([])
      reset({
        name: '',
        localName: '',
        tagline: '',
        description: '',
        category: 'fish',
        catchTime: '',
        howToCook: '',
        gallery_image_1: '',
        gallery_image_2: '',
        image: '',
        stockStatus: 'in_stock',
      })
      setSelectedBadges([])
      setLocalPreviewThumb(null)
      setLocalPreview1(null)
      setLocalPreview2(null)
    }
  }, [existing, reset])

  const currentImageThumb = useWatch({ control, name: 'image' })
  const displayImageThumb = localPreviewThumb || currentImageThumb
  const currentImage1 = useWatch({ control, name: 'gallery_image_1' })
  const displayImage1 = localPreview1 || currentImage1
  const currentImage2 = useWatch({ control, name: 'gallery_image_2' })
  const displayImage2 = localPreview2 || currentImage2

  useEffect(() => { setImageError1(false) }, [displayImage1])
  useEffect(() => { setImageError2(false) }, [displayImage2])

  // Auto-fill Tamil name if English name matches predefined list
  const watchedName = useWatch({ control, name: 'name' })
  useEffect(() => {
    if (watchedName) {
      const match = PREDEFINED_PRODUCTS.find(p => p.en === watchedName)
      if (match) {
        setValue('localName', match.ta, { shouldDirty: true })
      }
    }
  }, [watchedName, setValue])

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

    if (variants.length === 0) {
      addToast({ message: 'At least one variant (e.g. 500g) with pricing is required', type: 'warning' })
      return
    }

    const payload = {
      ...data,
      badges,
      weights: variants,
      variants: variants,
      sync_thumbnail_to_all: false
    }

    if (payload.image && thumbnailLibrary[payload.name] && payload.image !== thumbnailLibrary[payload.name]) {
      const confirmSync = await confirm({
        title: `Update Thumbnail for all "${payload.name}"?`,
        message: 'Click Confirm to update all variants with this name.\nClick Cancel to only update this specific variant.'
      })
      payload.sync_thumbnail_to_all = confirmSync
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
          onClick={async () => {
            if (isDirty) {
              const shouldDiscard = await confirm({
                title: 'Discard Unsaved Changes?',
                message: 'You have unsaved changes. Are you sure you want to discard them and leave this page?'
              })
              if (!shouldDiscard) return
            }
            navigate('/admin/products')
          }}
        >
          Back
        </AdminBtn>
      }
    >
      <ConfirmModal />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">
            <AdminCard title={isNew ? 'New Product' : `Edit — ${existing?.name ?? id}`}>
              <div className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: 'Product name is required' }}
                      render={({ field }) => (
                        <CustomComboBox
                          label="Product Name (English)"
                          placeholder="e.g. Seer Fish / Vanjaram"
                          options={[...new Set([...PREDEFINED_PRODUCTS.map(p => p.en), ...Object.keys(thumbnailLibrary)])]}
                          value={field.value}
                          onChange={async (val) => {
                            field.onChange(val)
                            
                            // Auto-fill thumbnail logic
                            if (thumbnailLibrary[val]) {
                              const currentImage = control._formValues.image
                              if (!currentImage) {
                                setValue('image', thumbnailLibrary[val], { shouldDirty: true })
                                setLocalPreviewThumb(thumbnailLibrary[val])
                                addToast({ message: 'Thumbnail auto-filled from library', type: 'success' })
                              } else {
                                const shouldFill = await confirm({
                                  title: 'Product Found in Library',
                                  message: 'A saved thumbnail exists for this product name. Do you want to auto-fill it and replace your current image?'
                                })
                                if (shouldFill) {
                                  setValue('image', thumbnailLibrary[val], { shouldDirty: true })
                                  setLocalPreviewThumb(thumbnailLibrary[val])
                                  addToast({ message: 'Thumbnail auto-filled from library', type: 'success' })
                                }
                              }
                            }
                            
                            // Try to auto-fill localName
                            const predefined = PREDEFINED_PRODUCTS.find(p => p.en === val)
                            if (predefined) {
                              const currentLocal = control._formValues.localName
                              if (!currentLocal) {
                                setValue('localName', predefined.ta, { shouldDirty: true })
                              }
                            }
                          }}
                          error={errors.name}
                          required
                        />
                      )}
                    />
                  </div>

                  {/* Local/Regional Name */}
                  <div className="col-span-2 md:col-span-1">
                    <Controller
                      name="localName"
                      control={control}
                      render={({ field }) => (
                        <CustomComboBox
                          label="Local/Regional Name"
                          placeholder="e.g. Vanjaram"
                          options={PREDEFINED_PRODUCTS.map(p => p.ta)}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.localName}
                        />
                      )}
                    />
                  </div>

                  {/* Stock Status */}
                  <div className="col-span-2 md:col-span-1">
                    <Controller
                      name="stockStatus"
                      control={control}
                      rules={{ required: 'Stock status is required' }}
                      render={({ field }) => (
                        <CustomSelect
                          label="Stock Status"
                          required
                          options={[
                            { label: 'In Stock', value: 'in_stock' },
                            { label: 'Low Stock', value: 'low_stock' },
                            { label: 'Out of Stock', value: 'out_of_stock' }
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.stockStatus}
                        />
                      )}
                    />
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
                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: 'Category is required' }}
                      render={({ field }) => (
                        <CustomSelect
                          label="Category"
                          required
                          options={CATEGORIES.map(c => ({ label: CATEGORY_LABELS[c] || c, value: c }))}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.category}
                        />
                      )}
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

              </div>
            </AdminCard>

            {/* Product Variants */}
            <AdminCard title="Product Variants">
              <div className="p-5 space-y-4">
                <p className="text-[12px] text-admin-text-sub">
                  Define different options for this product (e.g. label: "1 piece (~600g)", MRP: ₹799, Online Price: ₹699).
                  Every product must have at least one variant.
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
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      value={newVarMrp}
                      onChange={(e) => setNewVarMrp(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-2.5 py-2 rounded-[8px] border border-admin-border bg-white text-[12px] focus:outline-none focus:border-admin-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-admin-text uppercase tracking-[0.05em] mb-1">
                      Online Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={newVarOnlinePrice}
                      onChange={(e) => setNewVarOnlinePrice(e.target.value)}
                      placeholder="e.g. 450"
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
                          <th className="px-4 py-2.5">MRP (₹)</th>
                          <th className="px-4 py-2.5">Online Price (₹)</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-admin-border/40 text-[12px] text-admin-text">
                        {variants.map((v, idx) => (
                          <tr key={idx} className="hover:bg-admin-seafoam/20">
                            <td className="px-4 py-2.5 font-semibold">{v.label}</td>
                            <td className="px-4 py-2.5 line-through text-admin-text-sub">₹{v.mrp}</td>
                            <td className="px-4 py-2.5 font-bold text-admin-navy">₹{v.onlinePrice}</td>
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
            {/* Thumbnail — shown on product cards (Home, Category listing, etc.) */}
            <AdminCard title="Thumbnail (Required — shown on product cards)">
              <div className="p-4">
                <p className="text-[12px] text-admin-text-sub mb-3">
                  This image is used on product cards across the site (Home page, category listings, search results). Upload once per product — it's reused everywhere that product appears as a card.
                </p>
                <div className="mb-4">
                  {displayImageThumb && !imageErrorThumb ? (
                    <img src={displayImageThumb} alt="Thumbnail preview" className="w-full h-40 object-cover rounded-[10px] border border-admin-border" onError={() => setImageErrorThumb(true)} />
                  ) : displayImageThumb && imageErrorThumb ? (
                    <div className="w-full h-40 bg-admin-coral/10 border border-admin-coral border-dashed rounded-[10px] flex flex-col items-center justify-center text-admin-coral">
                      <span className="material-symbols-outlined mb-1" style={{ fontSize: '32px' }}>broken_image</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider">Invalid Image URL</span>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-admin-seafoam border border-admin-border border-dashed rounded-[10px] flex items-center justify-center text-admin-text-sub">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4 bg-admin-seafoam/50 p-1 rounded-full border border-admin-border/50">
                  <button type="button" onClick={() => setThumbUploadMode('url')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${thumbUploadMode === 'url' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>URL</button>
                  <button type="button" onClick={() => setThumbUploadMode('upload')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${thumbUploadMode === 'upload' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>Upload</button>
                </div>

                {thumbUploadMode === 'url' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
                    <input {...register('image')} placeholder="https://…" className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Choose File</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setLocalPreviewThumb(URL.createObjectURL(file))
                      setImageErrorThumb(false)
                      setUploadingThumb(true)
                      try {
                        const res = await uploadAdminImage(file)
                        if (res.success) {
                          setValue('image', res.url, { shouldDirty: true })
                          setLocalPreviewThumb(null)
                          addToast({ message: 'Thumbnail uploaded successfully!', type: 'success' })
                        } else addToast({ message: 'Failed to upload image', type: 'error' })
                      } catch (err) { addToast({ message: err.message, type: 'error' }) }
                      finally { setUploadingThumb(false) }
                    }} className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-admin-navy file:text-white hover:file:bg-admin-navy/90 focus:outline-none cursor-pointer" />
                    {uploadingThumb && <p className="text-[11px] text-admin-gold mt-2 font-bold animate-pulse">Uploading...</p>}
                    <input type="hidden" {...register('image')} />
                  </div>
                )}
              </div>
            </AdminCard>

            {/* Gallery Image 1 */}
            <AdminCard title="Product Photo 1 (Required — shown on product page)">
              <div className="p-4">
                <div className="mb-4">
                  {displayImage1 && !imageError1 ? (
                    <img src={displayImage1} alt="Preview" className="w-full h-40 object-cover rounded-[10px] border border-admin-border" onError={() => setImageError1(true)} />
                  ) : displayImage1 && imageError1 ? (
                    <div className="w-full h-40 bg-admin-coral/10 border border-admin-coral border-dashed rounded-[10px] flex flex-col items-center justify-center text-admin-coral">
                      <span className="material-symbols-outlined mb-1" style={{ fontSize: '32px' }}>broken_image</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider">Invalid Image URL</span>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-admin-seafoam border border-admin-border border-dashed rounded-[10px] flex items-center justify-center text-admin-text-sub">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4 bg-admin-seafoam/50 p-1 rounded-full border border-admin-border/50">
                  <button type="button" onClick={() => setImage1UploadMode('url')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${image1UploadMode === 'url' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>URL</button>
                  <button type="button" onClick={() => setImage1UploadMode('upload')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${image1UploadMode === 'upload' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>Upload</button>
                </div>

                {image1UploadMode === 'url' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
                    <input {...register('gallery_image_1')} placeholder="https://…" className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Choose File</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setLocalPreview1(URL.createObjectURL(file))
                      setImageError1(false)
                      setUploadingImage1(true)
                      try {
                        const res = await uploadAdminImage(file)
                        if (res.success) {
                          setValue('gallery_image_1', res.url, { shouldDirty: true })
                          setLocalPreview1(null)
                          addToast({ message: 'Image uploaded successfully!', type: 'success' })
                        } else addToast({ message: 'Failed to upload image', type: 'error' })
                      } catch (err) { addToast({ message: err.message, type: 'error' }) }
                      finally { setUploadingImage1(false) }
                    }} className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-admin-navy file:text-white hover:file:bg-admin-navy/90 focus:outline-none cursor-pointer" />
                    {uploadingImage1 && <p className="text-[11px] text-admin-gold mt-2 font-bold animate-pulse">Uploading...</p>}
                    <input type="hidden" {...register('gallery_image_1')} />
                  </div>
                )}
              </div>
            </AdminCard>

            {/* Gallery Image 2 */}
            <AdminCard title="Product Photo 2 (Optional)">
              <div className="p-4">
                <div className="mb-4">
                  {displayImage2 && !imageError2 ? (
                    <img src={displayImage2} alt="Preview" className="w-full h-40 object-cover rounded-[10px] border border-admin-border" onError={() => setImageError2(true)} />
                  ) : displayImage2 && imageError2 ? (
                    <div className="w-full h-40 bg-admin-coral/10 border border-admin-coral border-dashed rounded-[10px] flex flex-col items-center justify-center text-admin-coral">
                      <span className="material-symbols-outlined mb-1" style={{ fontSize: '32px' }}>broken_image</span>
                      <span className="text-[11px] font-bold uppercase tracking-wider">Invalid Image URL</span>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-admin-seafoam border border-admin-border border-dashed rounded-[10px] flex items-center justify-center text-admin-text-sub">
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>image</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-4 bg-admin-seafoam/50 p-1 rounded-full border border-admin-border/50">
                  <button type="button" onClick={() => setImage2UploadMode('url')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${image2UploadMode === 'url' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>URL</button>
                  <button type="button" onClick={() => setImage2UploadMode('upload')} className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-full transition-all select-none ${image2UploadMode === 'upload' ? 'bg-admin-navy text-white shadow-sm' : 'text-admin-text hover:bg-black/5'}`}>Upload</button>
                </div>

                {image2UploadMode === 'url' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Image URL</label>
                    <input {...register('gallery_image_2')} placeholder="https://…" className="w-full px-3 py-2.5 rounded-[10px] border border-admin-border bg-admin-seafoam text-[13px] focus:outline-none focus:border-admin-navy" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-admin-text uppercase tracking-[0.1em] mb-1.5">Choose File</label>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setLocalPreview2(URL.createObjectURL(file))
                      setImageError2(false)
                      setUploadingImage2(true)
                      try {
                        const res = await uploadAdminImage(file)
                        if (res.success) {
                          setValue('gallery_image_2', res.url, { shouldDirty: true })
                          setLocalPreview2(null)
                          addToast({ message: 'Image uploaded successfully!', type: 'success' })
                        } else addToast({ message: 'Failed to upload image', type: 'error' })
                      } catch (err) { addToast({ message: err.message, type: 'error' }) }
                      finally { setUploadingImage2(false) }
                    }} className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-admin-navy file:text-white hover:file:bg-admin-navy/90 focus:outline-none cursor-pointer" />
                    {uploadingImage2 && <p className="text-[11px] text-admin-gold mt-2 font-bold animate-pulse">Uploading...</p>}
                    <input type="hidden" {...register('gallery_image_2')} />
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