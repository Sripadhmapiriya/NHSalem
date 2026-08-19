import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Badge from './Badge'
import useCartStore from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'

/**
 * ProductCard — Level 1 card with:
 * - Image rounded on top only
 * - Badge (fresh/hot/new/premium)
 * - Weight chips that update price
 * - Add to Cart → morphs into quantity stepper
 * - Wishlist toggle
 */
export default function ProductCard({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(0)
  const { addItem, getItem, updateQuantity, removeItem } = useCartStore()
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore()
  const { addToast } = useToastStore()

  const {
    id,
    name,
    tagline,
    image,
    badges = [],
    weights = [],
    variants = [],
    basePrice,
    rating,
    reviewCount,
    unit,
    catchTime,
    categoryThumbnail,
  } = product

  const finalVariants = (variants && variants.length > 0)
    ? variants
    : ((weights && weights.length > 0)
      ? weights
      : (unit ? [{ label: unit, price: basePrice }] : []))

  const currentVariant = finalVariants[selectedVariant] || { label: unit || '500g', price: basePrice }
  const cartItem = getItem(id, currentVariant.label)
  const wishlisted = isWishlisted(id)

  const handleWishlistToggle = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
    if (!user) {
      setPendingAction({
        type: 'TOGGLE_WISHLIST',
        payload: { id, name }
      })
      setCartLoginPopupOpen(true)
      return
    }
    toggleWishlist(id)
  }

  const handleAdd = () => {
    const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
    if (!user) {
      setPendingAction({
        type: 'ADD_TO_CART',
        payload: {
          id,
          name,
          image: categoryThumbnail || image,
          weight: currentVariant.label,
          price: currentVariant.price,
          quantity: 1,
        }
      })
      setCartLoginPopupOpen(true)
      return
    }
    addItem({
      id,
      name,
      image: categoryThumbnail || image,
      weight: currentVariant.label,
      price: currentVariant.price,
      quantity: 1,
    })
    addToast({ message: `${name} added to cart!`, type: 'success' })
  }

  const handleIncrease = () => updateQuantity(id, currentVariant.label, cartItem.quantity + 1)
  const handleDecrease = () => {
    if (cartItem.quantity <= 1) removeItem(id, currentVariant.label)
    else updateQuantity(id, currentVariant.label, cartItem.quantity - 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 hover:border-slate-200 overflow-hidden group flex flex-col transition-all"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] w-full bg-slate-50">
        <Link to={`/product/${id}`} aria-label={`View ${name}`}>
          <img
            src={categoryThumbnail || image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-90" />
        </Link>

        {/* Badges (Max 2) */}
        {/* Badges (Max 2) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none z-10">
          {badges.slice(0, 2).map((badge) => {
            let icon = 'sell';
            let bgClass = 'bg-[rgba(255,255,255,0.15)]';
            
            if (badge.type === 'fresh') { icon = 'eco'; bgClass = 'bg-[rgba(16,185,129,0.25)]'; }
            else if (badge.type === 'deal') { icon = 'bolt'; bgClass = 'bg-[rgba(245,158,11,0.25)]'; }
            else if (badge.type === 'limited') { icon = 'lens'; bgClass = 'bg-[rgba(59,130,246,0.25)]'; }
            else if (badge.type === 'new') { icon = 'stars'; bgClass = 'bg-[rgba(168,85,247,0.25)]'; }

            return (
              <div 
                key={badge.type} 
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-white backdrop-blur-[10px] border border-[rgba(255,255,255,0.25)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] ${bgClass}`}
              >
                <span className="material-symbols-outlined text-[12px]">{icon}</span>
                {badge.label}
              </div>
            );
          })}
        </div>

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.25)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-10"
        >
          <span
            className={`material-symbols-outlined ${wishlisted ? 'filled text-white' : 'text-white'} transition-all [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]`}
            style={{ fontSize: '18px' }}
            aria-hidden="true"
          >
            favorite
          </span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title & Subtitle */}
        <div>
          <Link to={`/product/${id}`}>
            <h3 className="text-[17px] font-bold text-slate-900 tracking-tight line-clamp-1 hover:text-amber-600 transition-colors">
              {name}
            </h3>
          </Link>
          {tagline && (
            <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-1 font-medium">{tagline}</p>
          )}
        </div>

        {/* Weight/Quantity Selector */}
        {finalVariants.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 flex-nowrap mt-1">
            {finalVariants.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(i)}
                aria-pressed={selectedVariant === i}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                  selectedVariant === i
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Spacer to push price and CTA to bottom */}
        <div className="flex-1" />

        {/* Price & CTA Block */}
        <div className="pt-2 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-lg font-black text-slate-900">
              ₹{currentVariant.price?.toLocaleString()}
            </p>
            {currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price && (
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-slate-400 line-through font-medium">
                  ₹{currentVariant.originalPrice.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {Math.round(((currentVariant.originalPrice - currentVariant.price) / currentVariant.originalPrice) * 100)}% OFF
                </span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!cartItem ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-[#0a192f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm"
                aria-label={`Add ${name} to cart`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  shopping_cart
                </span>
                Add to Cart
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-between bg-[#0a192f] rounded-xl overflow-hidden p-1 shadow-inner"
              >
                <button
                  onClick={handleDecrease}
                  aria-label="Decrease quantity"
                  className="w-10 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    remove
                  </span>
                </button>
                <span className="px-2 text-center text-white text-sm font-bold">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="w-10 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    add
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
