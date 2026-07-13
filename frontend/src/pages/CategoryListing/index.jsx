import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import Chip from '@/components/ui/Chip'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { getProducts } from '@/services/api'
import Select from '@/components/ui/Select'

const CATEGORY_META = {
  fish: { title: 'Fresh Fish', description: 'Daily-caught fish from coastal partners. Cleaned, descaled, and ready to cook.' },
  'prawns-shrimp': { title: 'Fresh Prawns & Shrimp', description: 'From Jumbo Tiger Prawns to Coastal White Shrimp — all hand-selected, size-graded, and packed fresh.' },
  crabs: { title: 'Fresh Crabs', description: 'Live-packed crabs delivered the same day. Sweet, succulent, and full of flavour.' },
  lobster: { title: 'Premium Lobster', description: 'Spiny lobster tails from Lakshadweep waters. The pinnacle of Indian coastal seafood.' },
  'dry-fish': { title: 'Dry Fish', description: 'Traditional sun-dried and salt-preserved fish from coastal artisans.' },
  combos: { title: 'Value Combos', description: 'Curated seafood combo packs — great value, premium selection.' },
  shellfish: { title: 'Shellfish & Molluscs', description: 'Clams, mussels, oysters, and more from the cleanest Indian coastal waters.' },
}

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
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
function FilterGroup({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-outline-variant/30 py-4 last:border-0 text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-label-md font-bold text-on-surface uppercase tracking-wider mb-2 focus:outline-none"
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
 * FilterPanelComponent - complete premium filters drawer/sidebar content
 */
function FilterPanel({
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
}) {
  const minPercent = (priceMin / 3000) * 100
  const maxPercent = (priceMax / 3000) * 100

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
                className="text-label-md text-primary font-semibold hover:underline"
              >
                Clear All
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Accordion List */}
      <div className={bodyClass}>
        {/* Catch Type accordion */}
        <FilterGroup title="Catch Type">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            {CATCH_TYPES.map((item) => {
              const isSelected = selectedBadges.includes(item.id)
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 1.05 }}
                  onClick={() => toggleBadge(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-full border text-label-sm font-semibold transition-colors duration-150 text-left select-none focus:outline-none w-full ${
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
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="material-symbols-outlined text-white flex-shrink-0"
                      style={{ fontSize: '15px' }}
                    >
                      check
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </FilterGroup>

        {/* Price Range accordion */}
        <FilterGroup title="Price Range">
          <div className="px-1.5 pt-2">
            {/* Numeric Inputs */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 min-w-0 flex items-center gap-1 pl-3 pr-2 py-1.5 bg-surface-container-low border border-outline-variant rounded-full">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex-shrink-0">Min</span>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => {
                    const val = Math.min(Math.max(0, Number(e.target.value)), priceMax - 50)
                    setPriceMin(val)
                  }}
                  className="w-full min-w-0 bg-transparent text-label-md font-semibold text-on-surface text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 border-0"
                />
              </div>
              <span className="text-outline text-label-md flex-shrink-0">—</span>
              <div className="flex-1 min-w-0 flex items-center gap-1 pl-3 pr-2 py-1.5 bg-surface-container-low border border-outline-variant rounded-full">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider flex-shrink-0">Max</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => {
                    const val = Math.min(Math.max(priceMin + 50, Number(e.target.value)), 3000)
                    setPriceMax(val)
                  }}
                  className="w-full min-w-0 bg-transparent text-label-md font-semibold text-on-surface text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 border-0"
                />
              </div>
            </div>

            {/* Slider track container (mx-2 inset) */}
            <div className="relative mx-2 h-1.5 bg-surface-container rounded-full my-6 flex items-center">
              <div
                className="absolute h-1.5 bg-primary rounded-full"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              />
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={priceMin}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), priceMax - 100)
                  setPriceMin(val)
                }}
                className="dual-range-input"
              />
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={priceMax}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), priceMin + 100)
                  setPriceMax(val)
                }}
                className="dual-range-input"
              />
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {PRICE_PRESETS.map((p) => {
                const active = priceMin === p.min && priceMax === p.max
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      setPriceMin(p.min)
                      setPriceMax(p.max)
                    }}
                    className={`px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors duration-150 focus:outline-none select-none ${
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

      {/* Sticky footer action compound control */}
      <div className={footerClass}>
        <div className="w-full flex items-stretch border border-outline-variant/50 rounded-full overflow-hidden shadow-sm h-11 bg-white">
          {/* Left Zone - Clear */}
          <button
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className={`px-4 flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none select-none border-r border-outline-variant/50 group ${
              !hasActiveFilters 
                ? 'opacity-40 pointer-events-none bg-surface-container-low/20' 
                : 'bg-white hover:bg-surface-container-low active:bg-surface-container-high'
            }`}
            aria-label="Clear all filters"
          >
            <motion.span
              whileTap={hasActiveFilters ? { rotate: 360 } : {}}
              transition={{ duration: 0.4 }}
              className="material-symbols-outlined text-on-surface-variant group-hover:rotate-180 transition-transform duration-300 flex items-center justify-center leading-none"
              style={{ fontSize: '20px' }}
            >
              restart_alt
            </motion.span>
          </button>

          {/* Right Zone - Show Results */}
          <button
            onClick={onApply}
            className="flex-1 bg-primary text-white hover:bg-primary/95 active:scale-[0.98] flex items-center justify-center gap-2 px-6 transition-all duration-150 cursor-pointer select-none font-bold text-label-md focus:outline-none"
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
  const navigate = useNavigate()

  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('newest')
  const [selectedBadges, setSelectedBadges] = useState([])
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(3000)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const meta = CATEGORY_META[categorySlug] || { title: categorySlug, description: '' }

  useEffect(() => {
    setLoading(true)
    setSelectedBadges([])
    setPriceMin(0)
    setPriceMax(3000)
    getProducts({ category: categorySlug }).then((data) => {
      setAllProducts(data)
      setLoading(false)
    })
  }, [categorySlug])

  const toggleBadge = useCallback((id) => {
    setSelectedBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }, [])

  const filteredProducts = useMemo(() => {
    let results = [...allProducts]
    if (selectedBadges.length) {
      results = results.filter((p) =>
        p.badges?.some((b) => selectedBadges.includes(b.type))
      )
    }
    results = results.filter((p) => p.basePrice >= priceMin && p.basePrice <= priceMax)
    
    if (sort === 'price_asc') results.sort((a, b) => a.basePrice - b.basePrice)
    else if (sort === 'price_desc') results.sort((a, b) => b.basePrice - a.basePrice)
    else if (sort === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return results
  }, [allProducts, selectedBadges, priceMin, priceMax, sort])

  const activeCount = selectedBadges.length + (priceMin !== 0 || priceMax !== 3000 ? 1 : 0)
  const hasActiveFilters = selectedBadges.length > 0 || priceMin !== 0 || priceMax !== 3000
  
  const handleClearAll = useCallback(() => {
    setSelectedBadges([])
    setPriceMin(0)
    setPriceMax(3000)
  }, [])

  return (
    <div className="pt-8 pb-16 md:pb-24 bg-background min-h-screen">
      <div className="container-max">
        {/* Header */}
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface font-semibold">{meta.title}</span>
          </nav>
          <h1 className="text-display-lg-mobile text-on-surface mb-2">{meta.title}</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">{meta.description}</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter Card (Level 1 Card treatment: rounded-28, shadow-0_4_20_rgba(0,5,22,0.15)) */}
          <aside className="hidden lg:block w-72 flex-shrink-0" aria-label="Product filters">
            <div className="sticky top-24 bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,5,22,0.15)] border border-outline-variant/30 overflow-hidden relative max-h-[calc(100vh-120px)] flex flex-col z-30">
              <FilterPanel
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
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
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
                {/* Mobile filter button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon="tune"
                  iconPosition="left"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Open filters"
                >
                  Filters
                  {activeCount > 0 && (
                    <span className="ml-1 w-5 h-5 bg-primary text-on-primary rounded-full text-[10px] flex items-center justify-center">
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
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBadges.map((b) => (
                  <Chip key={b} selected removable onRemove={() => toggleBadge(b)}>
                    {CATCH_TYPES.find((f) => f.id === b)?.label || b}
                  </Chip>
                ))}
                {(priceMin !== 0 || priceMax !== 3000) && (
                  <Chip selected removable onRemove={() => { setPriceMin(0); setPriceMax(3000) }}>
                    ₹{priceMin} – ₹{priceMax}
                  </Chip>
                )}
              </div>
            )}

            {/* Product grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              aria-live="polite"
              aria-label={`${filteredProducts.length} products found`}
            >
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : filteredProducts.length > 0
                  ? filteredProducts.map((product) => (
                      <MemoProductCard key={product.id} product={product} />
                    ))
                  : (
                    <div className="col-span-full text-center py-20">
                      <span className="material-symbols-outlined text-outline text-6xl mb-4 block" aria-hidden="true">
                        search_off
                      </span>
                      <p className="text-headline-sm text-on-surface-variant mb-2">No products found</p>
                      <p className="text-body-md text-outline mb-6">Try adjusting your filters</p>
                      <Button variant="primary" onClick={handleClearAll}>
                        Clear Filters
                      </Button>
                    </div>
                  )
              }
            </div>
          </div>
        </div>
      </div>

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
          />
        </div>
      </Drawer>
    </div>
  )
}
