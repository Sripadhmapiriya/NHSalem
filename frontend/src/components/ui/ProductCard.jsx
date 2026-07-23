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
  } = product

  const finalVariants = (variants && variants.length > 0)
    ? variants
    : ((weights && weights.length > 0)
      ? weights
      : (unit ? [{ label: unit, price: basePrice }] : []))

  const currentVariant = finalVariants[selectedVariant] || { label: unit || '500g', price: basePrice }
  const cartItem = getItem(id, currentVariant.label)
  const wishlisted = isWishlisted(id)

  const handleWishlistToggle = () => {
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
          image,
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
      image,
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
      className="bg-white rounded-[28px] shadow-card overflow-hidden group flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square w-full">
        <Link to={`/product/${id}`} aria-label={`View ${name}`}>
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 max-w-[45%]">
          {badges.map((badge) => (
            <Badge key={badge.type} variant={badge.type}>
              {badge.label}
            </Badge>
          ))}
        </div>

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className="absolute top-3 right-3 w-9 h-9 bg-[#0b1e3d]/35 backdrop-blur-md border border-white/25 rounded-full flex items-center justify-center shadow-sm hover:bg-[#0b1e3d]/50 transition-colors"
        >
          <span
            className={`material-symbols-outlined ${wishlisted ? 'filled text-[#FB7185]' : 'text-white'} transition-all`}
            style={{ fontSize: '20px' }}
            aria-hidden="true"
          >
            favorite
          </span>
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col gap-3 flex-1">
        {/* Name + tagline */}
        <div>
          <Link to={`/product/${id}`}>
            <h3 className="text-headline-sm text-on-surface font-semibold line-clamp-2 hover:text-primary transition-colors text-sm md:text-base">
              {name}
            </h3>
          </Link>
          {tagline && (
            <p className="text-label-sm text-on-surface-variant mt-0.5 line-clamp-1 text-xs">{tagline}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = rating > 0 && star <= Math.round(rating)
              return (
                <span
                  key={star}
                  className={`material-symbols-outlined ${isFilled ? 'filled' : ''} text-secondary-container`}
                  style={{ fontSize: '14px' }}
                  aria-hidden="true"
                >
                  star
                </span>
              )
            })}
          </div>
          {rating > 0 ? (
            <span className="text-label-sm text-on-surface-variant">
              {rating} ({reviewCount?.toLocaleString()})
            </span>
          ) : (
            <span className="inline-flex items-center bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              New
            </span>
          )}
        </div>

        {/* Variant chips - scrollable on mobile */}
        {finalVariants.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-nowrap">
            {finalVariants.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setSelectedVariant(i)}
                aria-pressed={selectedVariant === i}
                className={`px-3 py-1 rounded-full text-label-sm border transition-all flex-shrink-0 ${
                  selectedVariant === i
                    ? 'bg-secondary-container text-on-secondary-container border-secondary-container font-semibold'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <p className="text-headline-sm font-bold text-on-surface">
              ₹{currentVariant.price.toLocaleString()}
            </p>
            {currentVariant.originalPrice && (
              <p className="text-label-sm text-outline line-through">
                ₹{currentVariant.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!cartItem ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={handleAdd}
                className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2.5 rounded-full text-label-md font-semibold hover:bg-primary-container transition-colors"
                aria-label={`Add ${name} to cart`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                  add_shopping_cart
                </span>
                Add
              </motion.button>
            ) : (
              <motion.div
                key="stepper"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-0 bg-primary rounded-full overflow-hidden"
              >
                <button
                  onClick={handleDecrease}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                    remove
                  </span>
                </button>
                <span className="px-2 min-w-[2rem] text-center text-on-primary text-label-md font-bold">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
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
