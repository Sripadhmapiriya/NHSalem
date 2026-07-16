import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Chip from '@/components/ui/Chip'
import Tabs, { TabPanel } from '@/components/ui/Tabs'
import FreshnessScoreCard from '@/components/ui/FreshnessScoreCard'
import ProductCard from '@/components/ui/ProductCard'
import { PageSkeleton } from '@/components/ui/Skeleton'
import Modal from '@/components/ui/Modal'
import useCartStore from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { getProductById, getProducts, checkDelivery } from '@/services/api'

const PRODUCT_TABS = [
  { id: 'description', label: 'Description', icon: 'article' },
  { id: 'how-to-cook', label: 'How to Cook', icon: 'soup_kitchen' },
  { id: 'nutrition', label: 'Nutritional Info', icon: 'nutrition' },
  { id: 'reviews', label: 'Reviews', icon: 'star' },
]

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedWeight, setSelectedWeight] = useState(0)
  const [pincode, setPincode] = useState('')
  const [deliveryResult, setDeliveryResult] = useState(null)
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const [certModalOpen, setCertModalOpen] = useState(false)

  const { addItem, getItem, updateQuantity, removeItem } = useCartStore()
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    setLoading(true)
    setSelectedImage(0)
    setSelectedWeight(0)
    setActiveTab('description')
    setDeliveryResult(null)
    Promise.all([
      getProductById(productId),
      getProducts(),
    ]).then(([prod, all]) => {
      setProduct(prod)
      setRelated(all.filter((p) => p.id !== productId).slice(0, 4))
      setLoading(false)
    })
  }, [productId])

  const currentWeight = product?.weights?.[selectedWeight] || { label: '500g', price: product?.basePrice }
  const cartItem = product ? getItem(product.id, currentWeight.label) : null
  const wishlisted = product ? isWishlisted(product.id) : false

  const handleAddToCart = useCallback(() => {
    if (!product) return
    const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
    if (!user) {
      setPendingAction({
        type: 'ADD_TO_CART',
        payload: {
          id: product.id,
          name: product.name,
          image: product.image,
          weight: currentWeight.label,
          price: currentWeight.price,
          quantity: 1,
        }
      })
      setCartLoginPopupOpen(true)
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      image: product.image,
      weight: currentWeight.label,
      price: currentWeight.price,
      quantity: 1,
    })
    addToast({ message: `${product.name} added to cart!`, type: 'success' })
  }, [product, currentWeight, addItem, addToast])

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) return
    setCheckingDelivery(true)
    const result = await checkDelivery(pincode)
    setDeliveryResult(result)
    setCheckingDelivery(false)
  }

  const handleAddPairItem = (item) => {
    const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
    if (!user) {
      setPendingAction({
        type: 'ADD_TO_CART',
        payload: { id: item.id, name: item.name, image: item.image, weight: '1x', price: item.price, quantity: 1 }
      })
      setCartLoginPopupOpen(true)
      return
    }
    addItem({ id: item.id, name: item.name, image: item.image, weight: '1x', price: item.price, quantity: 1 })
    addToast({ message: `${item.name} added to cart!`, type: 'success' })
  }

  if (loading) return <PageSkeleton />
  if (!product) return (
    <div className="container-max py-32 text-center">
      <h1 className="text-display-lg-mobile text-on-surface mb-4">Product Not Found</h1>
      <Button variant="primary" onClick={() => navigate('/category/fish')}>Browse All Products</Button>
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="container-max pt-6 pb-2 px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#5c6b7d] hover:text-[#0b1e3d] font-semibold group transition-colors select-none focus:outline-none mb-3"
        >
          <span className="w-8 h-8 rounded-full bg-[#f0f3f6] group-hover:bg-[#e4e9f0] flex items-center justify-center text-[16px] transition-colors">
            ←
          </span>
          Back
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-6 overflow-x-auto hide-scrollbar whitespace-nowrap pb-1">
          <Link to="/" className="text-gray-400 hover:text-green-700 transition-colors shrink-0">
            Home
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <Link
            to={`/category/${product.category}`}
            className="text-gray-400 hover:text-green-700 transition-colors capitalize shrink-0"
          >
            {product.category.replace(/-/g, ' ')}
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-xs shrink-0">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container-max pb-24 md:pb-8">

        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-[28px] aspect-[4/3] bg-surface-container-low">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 max-w-[45%]">
                {product.badges?.map((b) => (
                  <Badge key={b.type} variant={b.type}>{b.label}</Badge>
                ))}
              </div>
            </div>
            {/* Thumbnail strip */}
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={selectedImage === i}
                    className={`w-20 h-16 rounded-[12px] overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <h1 className="text-display-lg-mobile md:text-display-lg text-on-surface font-bold mb-1">{product.name}</h1>
              {product.tagline && (
                <p className="text-body-lg text-on-surface-variant italic">"{product.tagline}"</p>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined ${star <= Math.round(product.rating) ? 'filled' : ''} text-secondary-container`}
                      style={{ fontSize: '20px' }}
                      aria-hidden="true"
                    >star</span>
                  ))}
                </div>
                <span className="text-label-md font-semibold text-on-surface">{product.rating}</span>
                <span className="text-label-md text-on-surface-variant">({product.reviewCount?.toLocaleString()} reviews)</span>
              </div>
            )}

            {/* Freshness Score Card */}
            {product.freshnessScore && (
              <FreshnessScoreCard
                score={product.freshnessScore}
                catchTime={product.catchTime}
                batchFreshness={product.freshnessScore >= 95 ? 'Excellent' : product.freshnessScore >= 88 ? 'Very Good' : 'Good'}
                metrics={[
                  { icon: 'scale', label: 'Weight Integrity', value: 'Verified' },
                  { icon: 'water', label: 'Cold Chain', value: '2–4°C' },
                ]}
              />
            )}

            {/* Weight selector - horizontal scroll on mobile */}
            {product.weights?.length > 0 && (
              <div>
                <p className="text-label-md font-semibold text-on-surface mb-3">Select Weight</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 flex-nowrap">
                  {product.weights.map((w, i) => (
                    <button
                      key={w.label}
                      onClick={() => setSelectedWeight(i)}
                      aria-pressed={selectedWeight === i}
                      className={`px-4 py-2.5 rounded-full border-2 text-label-md font-semibold transition-all flex-shrink-0 ${
                        selectedWeight === i
                          ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
                          : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price (Desktop display) */}
            <div className="hidden md:flex items-baseline gap-3">
              <p className="text-4xl font-black text-on-surface">₹{currentWeight?.price?.toLocaleString()}</p>
              {currentWeight?.originalPrice && (
                <>
                  <p className="text-xl text-outline line-through">₹{currentWeight.originalPrice.toLocaleString()}</p>
                  <Badge variant="hot">
                    {Math.round((1 - currentWeight.price / currentWeight.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Price & CTA Action Deck - Sticky on Mobile, Static on Desktop */}
            <div className="fixed md:static bottom-0 left-0 right-0 bg-white md:bg-transparent border-t md:border-0 border-outline-variant/30 md:border-transparent p-4 md:p-0 z-30 flex items-center justify-between md:justify-start gap-4 pb-safe md:pb-0 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:shadow-none">
              {/* Left price summary (Mobile only) */}
              <div className="md:hidden flex flex-col items-start">
                <p className="text-2xl font-black text-on-surface">
                  ₹{currentWeight?.price?.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-outline-variant uppercase">
                  {currentWeight?.label}
                </p>
              </div>

              {/* Stepper / Add button */}
              <div className="flex-1 md:flex-none flex items-center gap-2">
                {!cartItem ? (
                  <Button variant="primary" size="lg" className="w-full md:w-56" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center bg-primary rounded-full overflow-hidden h-12 w-full md:w-56 justify-between">
                    <button
                      onClick={() => {
                        if (cartItem.quantity <= 1) removeItem(product.id, currentWeight.label)
                        else updateQuantity(product.id, currentWeight.label, cartItem.quantity - 1)
                      }}
                      aria-label="Decrease quantity"
                      className="px-4 py-3 flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                    </button>
                    <span className="px-4 text-on-primary font-bold text-label-lg">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, currentWeight.label, cartItem.quantity + 1)}
                      aria-label="Increase quantity"
                      className="px-4 py-3 flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                    </button>
                  </div>
                )}

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="w-12 h-12 bg-surface-container-low border border-outline-variant rounded-full flex items-center justify-center hover:border-on-tertiary-container transition-colors flex-shrink-0"
                >
                  <span
                    className={`material-symbols-outlined ${wishlisted ? 'filled' : ''} text-on-tertiary-container`}
                    style={{ fontSize: '20px' }}
                  >favorite</span>
                </button>
              </div>
            </div>

            {/* Delivery check */}
            <div className="bg-surface-container-low rounded-[16px] p-4">
              <p className="text-label-md font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '18px' }} aria-hidden="true">local_shipping</span>
                Check Delivery Timelines
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter pincode"
                  maxLength={6}
                  aria-label="Enter delivery pincode"
                  className="flex-1 rounded-full border border-outline-variant bg-white px-4 py-2.5 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  loading={checkingDelivery}
                  disabled={pincode.length !== 6}
                  onClick={handleCheckDelivery}
                >
                  Check
                </Button>
              </div>
              {deliveryResult && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 flex items-start gap-2 text-label-md ${
                    deliveryResult.available ? 'text-success' : 'text-error'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                    {deliveryResult.available ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p>{deliveryResult.message}</p>
                    {deliveryResult.slots && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {deliveryResult.slots.map((slot) => (
                          <span key={slot} className="px-2.5 py-1 bg-success/10 text-success rounded-full text-label-sm">
                            {slot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mb-16">
          <Tabs tabs={PRODUCT_TABS} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-6">
            <TabPanel id="description" activeTab={activeTab}>
              <div className="max-w-3xl text-body-lg text-on-surface-variant leading-relaxed">
                <p>{product.description}</p>
              </div>
            </TabPanel>

            <TabPanel id="how-to-cook" activeTab={activeTab}>
              <div className="max-w-3xl">
                <div className="bg-surface-container-low rounded-[20px] p-6 text-body-lg text-on-surface-variant leading-relaxed">
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }} aria-hidden="true">soup_kitchen</span>
                    <p className="text-headline-sm font-semibold text-on-surface">Cooking Guide</p>
                  </div>
                  <p>{product.howToCook}</p>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="nutrition" activeTab={activeTab}>
              <div className="max-w-md">
                {product.nutritionPer100g ? (
                  <div className="bg-white rounded-[20px] shadow-card p-6">
                    <p className="text-headline-sm font-semibold text-on-surface mb-4">Nutrition per 100g</p>
                    <div className="space-y-3">
                      {Object.entries(product.nutritionPer100g).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-outline-variant/30 pb-2">
                          <span className="text-body-md text-on-surface-variant capitalize">{k}</span>
                          <span className="text-label-md font-semibold text-on-surface">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-body-lg text-on-surface-variant">Nutritional information coming soon.</p>
                )}
              </div>
            </TabPanel>

            <TabPanel id="reviews" activeTab={activeTab}>
              {product.reviews?.length > 0 ? (
                <div className="space-y-4 max-w-3xl">
                  {/* Star breakdown */}
                  {product.starBreakdown && (
                    <div className="bg-white rounded-[20px] shadow-card p-6 mb-6 flex items-center gap-8">
                      <div className="text-center flex-shrink-0">
                        <p className="text-5xl font-black text-on-surface">{product.rating}</p>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={`material-symbols-outlined ${s <= Math.round(product.rating) ? 'filled' : ''} text-secondary-container`} style={{ fontSize: '16px' }} aria-hidden="true">star</span>
                          ))}
                        </div>
                        <p className="text-label-sm text-on-surface-variant mt-1">{product.reviewCount?.toLocaleString()} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map((star) => {
                          const pct = product.starBreakdown[star] || 0
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-label-sm text-on-surface-variant w-4 text-right">{star}</span>
                              <span className="material-symbols-outlined text-secondary-container filled" style={{ fontSize: '14px' }} aria-hidden="true">star</span>
                              <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  whileInView={{ scaleX: pct / 100 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: star * 0.05 }}
                                  style={{ transformOrigin: 'left' }}
                                  className="h-full bg-secondary-container rounded-full"
                                />
                              </div>
                              <span className="text-label-sm text-on-surface-variant w-8">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {product.reviews.map((review, i) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.1 }}
                      className="bg-white rounded-[20px] shadow-card p-5"
                    >
                      <div className="flex items-start gap-4">
                        <img src={review.avatar} alt={review.author} className="w-11 h-11 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-label-md font-semibold text-on-surface">{review.author}</span>
                            {review.verified && (
                              <span className="text-label-sm text-success flex items-center gap-0.5">
                                <span className="material-symbols-outlined filled" style={{ fontSize: '14px' }} aria-hidden="true">verified</span>
                                Verified Purchase
                              </span>
                            )}
                            <span className="text-label-sm text-on-surface-variant ml-auto">{review.date}</span>
                          </div>
                          <div className="flex gap-0.5 mt-0.5 mb-2">
                            {[1,2,3,4,5].map((s) => (
                              <span key={s} className={`material-symbols-outlined ${s <= review.rating ? 'filled' : ''} text-secondary-container`} style={{ fontSize: '14px' }} aria-hidden="true">star</span>
                            ))}
                          </div>
                          <p className="text-label-md font-semibold text-on-surface mb-1">{review.title}</p>
                          <p className="text-body-md text-on-surface-variant">{review.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-body-lg text-on-surface-variant">No reviews yet. Be the first!</p>
              )}
            </TabPanel>
          </div>
        </div>

        {/* Pairs Well With */}
        {product.pairsWellWith?.length > 0 && (
          <section className="mb-16" aria-labelledby="pairs-heading">
            <h2 id="pairs-heading" className="text-headline-md text-on-surface mb-6">Pairs Well With</h2>
            <div className="flex gap-4 overflow-x-auto carousel-scroll pb-2">
              {product.pairsWellWith.map((item) => (
                <div
                  key={item.id}
                  className="carousel-item flex-shrink-0 w-44 bg-white rounded-[20px] shadow-card overflow-hidden"
                >
                  <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" loading="lazy" />
                  <div className="p-3">
                    <p className="text-label-md font-semibold text-on-surface mb-1 line-clamp-2">{item.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-label-md font-bold text-on-surface">₹{item.price}</span>
                      <button
                        onClick={() => handleAddPairItem(item)}
                        aria-label={`Add ${item.name} to cart`}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '18px' }} aria-hidden="true">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Other Seafood You'll Love */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-headline-md text-on-surface mb-6">Other Seafood You'll Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
