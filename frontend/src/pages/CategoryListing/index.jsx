import { useState, useEffect, useMemo, useCallback, memo, useId } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import Chip from '@/components/ui/Chip'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { getProducts } from '@/services/api'
import Select from '@/components/ui/Select'

const CATEGORIES = [
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'prawns-shrimp', label: 'Prawns & Shrimp', emoji: '🍤' },
  { id: 'crabs', label: 'Crabs', emoji: '🦀' },
  { id: 'lobster', label: 'Lobster', emoji: '🦞' },
  { id: 'dried-fish', label: 'Dried Fish', emoji: '🧂' },
  { id: 'combos', label: 'Combos', emoji: '🍱' },
]

const PACK_SIZES = [
  { id: '500g', label: '500g' },
  { id: '1kg', label: '1kg' },
  { id: '2kg', label: '2kg' },
  { id: 'gross', label: 'Gross Weight' },
]

const CATEGORY_META = {
  all: { title: 'All Seafood Categories', description: 'Explore our complete selection of daily-caught ocean fish, prawns, crabs, lobsters, dried fish, and curated combos.' },
  fish: { title: 'Fresh Fish', description: 'Daily-caught fish from coastal partners. Cleaned, descaled, and ready to cook.' },
  'prawns-shrimp': { title: 'Fresh Prawns & Shrimp', description: 'From Jumbo Tiger Prawns to Coastal White Shrimp — all hand-selected, size-graded, and packed fresh.' },
  crabs: { title: 'Fresh Crabs', description: 'Live-packed crabs delivered the same day. Sweet, succulent, and full of flavour.' },
  lobster: { title: 'Premium Lobster', description: 'Spiny lobster tails from Lakshadweep waters. The pinnacle of Indian coastal seafood.' },
  'dry-fish': { title: 'Dried Fish', description: 'Traditional sun-dried and salt-preserved fish from coastal artisans.' },
  'dried-fish': { title: 'Dried Fish', description: 'Traditional sun-dried and salt-preserved fish from coastal artisans.' },
  combos: { title: 'Value Combos', description: 'Curated seafood combo packs — great value, premium selection.' },
}

const SORT_OPTIONS = [
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'newest', label: 'Newest First' },
  { id: 'az', label: 'Alphabetical: A to Z' },
  { id: 'za', label: 'Alphabetical: Z to A' },
]

const CATCH_TYPES = [
  { id: 'fresh', label: 'Fresh', icon: 'eco', color: '#4ADE80', bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]' },
  { id: 'hot', label: 'Deal', icon: 'bolt', color: '#FB7185', bg: 'bg-[#FB7185]/10', text: 'text-[#FB7185]' },
  { id: 'new', label: 'New', icon: 'auto_awesome', color: '#A78BFA', bg: 'bg-[#A78BFA]/10', text: 'text-[#A78BFA]' },
  { id: 'premium', label: 'Premium', icon: 'star', color: '#FBBF24', bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]' },
]

const PRICE_PRESETS = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–₹1,000', min: 500, max: 1000 },
  { label: 'Over ₹1,000', min: 1000, max: 3000 },
]

const MemoProductCard = memo(ProductCard)

/**
 * FilterGroup - collapsible block with height animation and rotating chevron
 */
function FilterGroup({ title, children, defaultOpen = true, headerExtra }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-outline-variant/30 py-4 last:border-0 text-left">
      <div className="w-full flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-label-md font-bold text-on-surface uppercase tracking-wider focus:outline-none min-h-[36px]"
        >
          <span>{title}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="material-symbols-outlined text-outline-variant flex items-center justify-center leading-none"
            style={{ fontSize: '20px' }}
          >
            expand_more
          </motion.span>
        </button>
        {headerExtra}
      </div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="pt-2 pb-1">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

/**
 * FilterPanel - complete filters drawer/sidebar content
 */
function FilterPanel({
  selectedCategories,
  toggleCategory,
  selectedWeights,
  toggleWeight,
  selectedBadges,
  toggleBadge,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  activeCount,
  handleClearAll,
  hasActiveFilters,
  resultCount,
  onApply,
  hideHeader = false,
  maxPriceLimit = 9999,
}) {
  const minPercent = (priceMin / maxPriceLimit) * 100
  const maxPercent = (priceMax / maxPriceLimit) * 100

  const minInputId = useId()
  const maxInputId = useId()

  const [tempMin, setTempMin] = useState(priceMin)
  const [tempMax, setTempMax] = useState(priceMax)

  useEffect(() => {
    setTempMin(priceMin)
  }, [priceMin])

  useEffect(() => {
    setTempMax(priceMax)
  }, [priceMax])

  const handleMinChange = (valStr) => {
    let val = Number(valStr) || 0
    if (val < 0) val = 0
    if (val > priceMax) val = priceMax
    setPriceMin(val)
    setTempMin(val)
  }

  const handleMaxChange = (valStr) => {
    let val = Number(valStr) || maxPriceLimit
    if (val < 0) val = 0
    if (val < priceMin) val = priceMin
    if (val > maxPriceLimit) val = maxPriceLimit
    setPriceMax(val)
    setTempMax(val)
  }

  const bodyClass = hideHeader
    ? 'flex-1 overflow-y-auto pt-2 pb-8 space-y-4'
    : 'flex-1 overflow-y-auto px-6 pt-4 pb-8 space-y-4'

  const footerClass = hideHeader
    ? 'pb-2 pt-4 border-t border-outline-variant/10 bg-white flex-shrink-0'
    : 'px-6 pb-6 pt-4 border-t border-outline-variant/10 bg-white flex-shrink-0'

  return (
    <div className="flex flex-col h-full max-h-[inherit] bg-white">
      {/* Header row */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm text-on-surface font-semibold">Filters</h2>
            {activeCount > 0 && (
              <span className="px-2.5 py-0.5 bg-primary text-white rounded-full text-[11px] font-bold">
                {activeCount} active
              </span>
            )}
          </div>
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClearAll}
                className="text-label-md text-primary font-semibold hover:underline min-h-[44px] flex items-center px-2"
              >
                Clear All
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Accordion List */}
      <div className={bodyClass}>
        {/* Category Accordion */}
        <FilterGroup title="Categories">
          <div className="flex flex-col gap-2 w-full">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-label-md font-medium transition-all duration-150 text-left select-none focus:outline-none w-full min-h-[44px] ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                      : 'bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant/60 bg-white'
                  }`}>
                    {isSelected && (
                      <span className="material-symbols-outlined text-white text-[14px]">check</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </FilterGroup>

        {/* Pack Size / Weight accordion */}
        <FilterGroup title="Pack Size">
          <div className="flex flex-wrap gap-2 w-full">
            {PACK_SIZES.map((pack) => {
              const isSelected = selectedWeights.includes(pack.id)
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => toggleWeight(pack.id)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-semibold transition-all duration-150 focus:outline-none select-none min-h-[38px] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary border-primary text-white font-bold shadow-sm'
                      : 'bg-white border-outline-variant/50 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <span>{pack.label}</span>
                  {isSelected && <span className="material-symbols-outlined text-xs">close</span>}
                </button>
              )
            })}
          </div>
        </FilterGroup>

        {/* Catch Type / Badges accordion */}
        <FilterGroup title="Catch Type / Badge">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {CATCH_TYPES.map((item) => {
              const isSelected = selectedBadges.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleBadge(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-full border text-label-sm font-semibold transition-all duration-150 text-left select-none focus:outline-none w-full min-h-[44px] ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                    <span className={`material-symbols-outlined text-[13px] filled ${item.text}`} aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>
                  <span className="flex-1 truncate leading-none">{item.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-white flex-shrink-0 text-[15px]">
                      check
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </FilterGroup>

        {/* Price Range accordion */}
        <FilterGroup
          title="Price Range"
          headerExtra={
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPriceMin(0)
                setPriceMax(maxPriceLimit)
              }}
              className="text-[11px] font-bold text-primary hover:underline lowercase tracking-wide min-h-[32px] flex items-center px-1"
            >
              Reset
            </button>
          }
        >
          <div className="px-1.5 pt-2">
            {/* Numeric Inputs */}
            <div className="flex items-center gap-2 mb-6">
              <div
                onClick={() => document.getElementById(minInputId)?.focus()}
                className="flex-1 min-w-0 flex items-center gap-1 pl-3 pr-2 py-2 bg-surface-container-low border border-outline-variant rounded-full cursor-text min-h-[44px]"
              >
                <label htmlFor={minInputId} className="text-[11px] font-bold text-outline uppercase tracking-wider flex-shrink-0 cursor-pointer select-none">Min</label>
                <input
                  id={minInputId}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tempMin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setTempMin(val)
                  }}
                  onBlur={() => handleMinChange(tempMin)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleMinChange(tempMin)
                  }}
                  className="w-full min-w-0 bg-transparent text-label-md font-semibold text-on-surface text-right focus:outline-none p-0 border-0"
                />
              </div>
              <span className="text-outline text-label-md flex-shrink-0">—</span>
              <div
                onClick={() => document.getElementById(maxInputId)?.focus()}
                className="flex-1 min-w-0 flex items-center gap-1 pl-3 pr-2 py-2 bg-surface-container-low border border-outline-variant rounded-full cursor-text min-h-[44px]"
              >
                <label htmlFor={maxInputId} className="text-[11px] font-bold text-outline uppercase tracking-wider flex-shrink-0 cursor-pointer select-none">Max</label>
                <input
                  id={maxInputId}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tempMax}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    setTempMax(val)
                  }}
                  onBlur={() => handleMaxChange(tempMax)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleMaxChange(tempMax)
                  }}
                  className="w-full min-w-0 bg-transparent text-label-md font-semibold text-on-surface text-right focus:outline-none p-0 border-0"
                />
              </div>
            </div>

            {/* Slider track container */}
            <div className="relative mx-2 h-1.5 bg-surface-container rounded-full my-6 flex items-center">
              <div
                className="absolute h-1.5 bg-primary rounded-full"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="10"
                value={priceMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax - 10)
                  setPriceMin(val)
                }}
                className="dual-range-input"
                style={{ zIndex: priceMin > (maxPriceLimit / 2) ? 40 : 30 }}
              />
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="10"
                value={priceMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin + 10)
                  setPriceMax(val)
                }}
                className="dual-range-input"
                style={{ zIndex: priceMin > (maxPriceLimit / 2) ? 30 : 40 }}
              />
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {PRICE_PRESETS.map((p) => {
                const active = priceMin === p.min && priceMax === p.max
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPriceMin(p.min)
                      setPriceMax(p.max)
                    }}
                    className={`px-3.5 py-2 rounded-full border text-[12px] font-semibold transition-colors duration-150 focus:outline-none select-none min-h-[38px] ${
                      active
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>
        </FilterGroup>
      </div>

      {/* Sticky footer action bar */}
      <div className={footerClass}>
        <div className="w-full flex items-stretch border border-outline-variant/50 rounded-full overflow-hidden shadow-sm h-12 bg-white">
          {/* Left Zone - Clear */}
          <button
            type="button"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className={`px-4 flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none select-none border-r border-outline-variant/50 group min-h-[44px] ${
              !hasActiveFilters 
                ? 'opacity-40 pointer-events-none bg-surface-container-low/20' 
                : 'bg-white hover:bg-surface-container-low active:bg-surface-container-high'
            }`}
            aria-label="Clear all filters"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant group-hover:rotate-180 transition-transform duration-300 flex items-center justify-center leading-none"
              style={{ fontSize: '20px' }}
            >
              restart_alt
            </span>
          </button>

          {/* Right Zone - Show Results */}
          <button
            type="button"
            onClick={onApply}
            className="flex-1 bg-primary text-white hover:bg-primary/95 active:scale-[0.98] flex items-center justify-center gap-2 px-6 transition-all duration-150 cursor-pointer select-none font-bold text-label-md focus:outline-none min-h-[44px]"
          >
            <span>Show {resultCount} Results</span>
            <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CategoryListing() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('price_asc')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedWeights, setSelectedWeights] = useState([])
  const [selectedBadges, setSelectedBadges] = useState([])
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(9999)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Initialize selected category from route or query params
  useEffect(() => {
    const queryCategory = searchParams.get('category')
    const activeCategory = categorySlug || queryCategory

    if (activeCategory) {
      const normalized = activeCategory.toLowerCase().trim()
      // Handle dry-fish vs dried-fish alias
      const resolvedCat = normalized === 'dry-fish' ? 'dried-fish' : normalized
      setSelectedCategories([resolvedCat])
    } else {
      setSelectedCategories([])
    }
  }, [categorySlug, searchParams])

  const metaKey = selectedCategories.length === 1 ? selectedCategories[0] : (categorySlug || 'all')
  const meta = CATEGORY_META[metaKey] || {
    title: selectedCategories.length > 0 ? `${selectedCategories.length} Categories Selected` : 'Products',
    description: 'Explore our complete selection of daily-caught ocean fish, prawns, crabs, lobsters, dried fish, and curated combos.'
  }

  const maxPriceLimit = useMemo(() => {
    if (allProducts.length === 0) return 9999
    let max = 0
    allProducts.forEach((p) => {
      const finalVars = (p.variants && p.variants.length > 0)
        ? p.variants
        : ((p.weights && p.weights.length > 0) ? p.weights : [])
      const price = finalVars.length > 0 ? finalVars[0].price : p.basePrice
      if (price > max) max = price
    })
    return max || 9999
  }, [allProducts])

  useEffect(() => {
    setLoading(true)
    getProducts().then((data) => {
      setAllProducts(data)
      setLoading(false)
      let max = 0
      data.forEach((p) => {
        const finalVars = (p.variants && p.variants.length > 0)
          ? p.variants
          : ((p.weights && p.weights.length > 0) ? p.weights : [])
        const price = finalVars.length > 0 ? finalVars[0].price : p.basePrice
        if (price > max) max = price
      })
      setPriceMax(max || 9999)
    })
  }, [])

  const toggleCategory = useCallback((id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }, [])

  const toggleWeight = useCallback((id) => {
    setSelectedWeights((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    )
  }, [])

  const toggleBadge = useCallback((id) => {
    setSelectedBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }, [])

  const filteredProducts = useMemo(() => {
    const getProductPrice = (p) => {
      const finalVars = (p.variants && p.variants.length > 0)
        ? p.variants
        : ((p.weights && p.weights.length > 0) ? p.weights : [])
      if (finalVars.length > 0) return finalVars[0].price
      return p.basePrice
    }

    let results = [...allProducts]

    // 1. Category Filter
    if (selectedCategories.length > 0) {
      results = results.filter((p) => {
        const pCat = p.category ? p.category.toLowerCase().trim() : ''
        return selectedCategories.some((sc) => {
          if (sc === 'dried-fish' || sc === 'dry-fish') {
            return pCat === 'dried-fish' || pCat === 'dry-fish'
          }
          return pCat === sc
        })
      })
    }

    // 2. Weight / Pack Size Filter
    if (selectedWeights.length > 0) {
      results = results.filter((p) => {
        const pWeights = (p.variants && p.variants.length > 0)
          ? p.variants.map((v) => v.label.toLowerCase())
          : ((p.weights && p.weights.length > 0) ? p.weights.map((w) => w.label.toLowerCase()) : [p.unit?.toLowerCase() || ''])
        
        return selectedWeights.some((sw) => {
          const target = sw.toLowerCase()
          if (target === 'gross') return pWeights.some((w) => w.includes('gross'))
          return pWeights.some((w) => w.includes(target))
        })
      })
    }

    // 3. Catch Type / Badge Filter
    if (selectedBadges.length > 0) {
      results = results.filter((p) =>
        p.badges?.some((b) => selectedBadges.includes(b.type))
      )
    }

    // 4. Price Filter
    results = results.filter((p) => {
      const displayPrice = getProductPrice(p)
      return displayPrice >= priceMin && displayPrice <= priceMax
    })

    // 5. Sorting
    if (sort === 'az') {
      results.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'za') {
      results.sort((a, b) => b.name.localeCompare(a.name))
    } else if (sort === 'price_asc') {
      results.sort((a, b) => getProductPrice(a) - getProductPrice(b))
    } else if (sort === 'price_desc') {
      results.sort((a, b) => getProductPrice(b) - getProductPrice(a))
    } else if (sort === 'rating') {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sort === 'newest') {
      results.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    return results
  }, [allProducts, selectedCategories, selectedWeights, selectedBadges, priceMin, priceMax, sort])

  const activeCount = selectedCategories.length + selectedWeights.length + selectedBadges.length + (priceMin !== 0 || priceMax !== maxPriceLimit ? 1 : 0)
  const hasActiveFilters = selectedCategories.length > 0 || selectedWeights.length > 0 || selectedBadges.length > 0 || priceMin !== 0 || priceMax !== maxPriceLimit

  const handleClearAll = useCallback(() => {
    setSelectedCategories([])
    setSelectedWeights([])
    setSelectedBadges([])
    setPriceMin(0)
    setPriceMax(maxPriceLimit)
    if (categorySlug) {
      navigate('/category', { replace: true })
    }
  }, [maxPriceLimit, categorySlug, navigate])

  return (
    <div className="pt-6 pb-16 md:pb-24 bg-background min-h-screen">
      <div className="container-max">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#000516] bg-white border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-1.5 rounded-full shadow-sm transition-all duration-200 group"
            >
              <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              <span>Back to Home</span>
            </Link>

            <nav aria-label="Breadcrumb" className="overflow-x-auto hide-scrollbar">
              <ul className="flex flex-row items-center flex-nowrap gap-2 text-xs text-slate-500 whitespace-nowrap">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-slate-800 font-semibold">{meta.title}</li>
              </ul>
            </nav>
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-[#000516] mb-1 leading-snug">{meta.title}</h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">{meta.description}</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter Card */}
          <aside className="hidden lg:block w-72 flex-shrink-0" aria-label="Product filters">
            <div className="sticky top-24 bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,5,22,0.12)] border border-outline-variant/30 overflow-hidden relative max-h-[calc(100vh-120px)] flex flex-col z-30">
              <FilterPanel
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedWeights={selectedWeights}
                toggleWeight={toggleWeight}
                selectedBadges={selectedBadges}
                toggleBadge={toggleBadge}
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                activeCount={activeCount}
                handleClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredProducts.length}
                onApply={() => {}}
                maxPriceLimit={maxPriceLimit}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm">
              <p className="text-label-md text-on-surface-variant">
                {loading ? '…' : (
                  <>
                    Showing{' '}
                    <motion.span
                      key={filteredProducts.length}
                      initial={{ opacity: 0.6, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="font-bold text-primary"
                    >
                      {filteredProducts.length}
                    </motion.span>
                    {' '}products
                  </>
                )}
              </p>

              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon="tune"
                  iconPosition="left"
                  className="lg:hidden min-h-[44px]"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Open filters"
                >
                  Filters
                  {activeCount > 0 && (
                    <span className="ml-1 w-5 h-5 bg-primary text-on-primary rounded-full text-[10px] flex items-center justify-center font-bold">
                      {activeCount}
                    </span>
                  )}
                </Button>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-label-md text-on-surface-variant hidden sm:block">
                    Sort:
                  </label>
                  <Select
                    id="sort-select"
                    value={sort}
                    onChange={(val) => setSort(val)}
                    options={SORT_OPTIONS}
                    className="w-48"
                  />
                </div>
              </div>
            </div>

            {/* Active filters strip */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map((c) => (
                  <Chip key={c} selected removable onRemove={() => toggleCategory(c)}>
                    {CATEGORIES.find((cat) => cat.id === c)?.label || c}
                  </Chip>
                ))}
                {selectedWeights.map((w) => (
                  <Chip key={w} selected removable onRemove={() => toggleWeight(w)}>
                    Pack: {PACK_SIZES.find((p) => p.id === w)?.label || w}
                  </Chip>
                ))}
                {selectedBadges.map((b) => (
                  <Chip key={b} selected removable onRemove={() => toggleBadge(b)}>
                    {CATCH_TYPES.find((f) => f.id === b)?.label || b}
                  </Chip>
                ))}
                {(priceMin !== 0 || priceMax !== maxPriceLimit) && (
                  <Chip selected removable onRemove={() => { setPriceMin(0); setPriceMax(maxPriceLimit) }}>
                    ₹{priceMin} – ₹{priceMax}
                  </Chip>
                )}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-bold text-primary hover:underline px-2.5 py-1 flex items-center min-h-[36px]"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product grid - 2 columns mobile, 3-4 columns desktop */}
            <div
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
              aria-live="polite"
              aria-label={`${filteredProducts.length} products found`}
            >
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filteredProducts.length > 0
                  ? filteredProducts.map((product) => (
                      <MemoProductCard key={product.id} product={product} />
                    ))
                  : (
                      <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-outline-variant/30 px-4">
                        <span className="material-symbols-outlined text-outline text-6xl mb-3 block" aria-hidden="true">
                          search_off
                        </span>
                        <h3 className="text-headline-sm text-on-surface font-bold mb-1">No products match your filters</h3>
                        <p className="text-body-md text-on-surface-variant max-w-sm mx-auto mb-6">Try clearing some of your filter criteria or view all products.</p>
                        <Button variant="primary" onClick={handleClearAll} className="min-h-[44px]">
                          Clear Filters
                        </Button>
                      </div>
                    )
              }
            </div>
          </div>
        </div>
      </div>

      {/* Floating Filters Button - Mobile Only */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="lg:hidden fixed bottom-20 left-4 z-40 bg-white text-primary border border-outline-variant shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold hover:bg-surface-container transition-colors active:scale-95 duration-100 min-h-[44px]"
        aria-label="Open filter preferences"
      >
        <span className="material-symbols-outlined text-[16px]">tune</span>
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile filter drawer */}
      <Drawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        id="mobile-filters"
        side="bottom"
      >
        <div className="p-1">
          <FilterPanel
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedWeights={selectedWeights}
            toggleWeight={toggleWeight}
            selectedBadges={selectedBadges}
            toggleBadge={toggleBadge}
            priceMin={priceMin}
            priceMax={priceMax}
            setPriceMin={setPriceMin}
            setPriceMax={setPriceMax}
            activeCount={activeCount}
            handleClearAll={handleClearAll}
            hasActiveFilters={hasActiveFilters}
            resultCount={filteredProducts.length}
            onApply={() => setFiltersOpen(false)}
            hideHeader={true}
            maxPriceLimit={maxPriceLimit}
          />
        </div>
      </Drawer>
    </div>
  )
}
