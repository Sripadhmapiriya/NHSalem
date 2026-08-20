import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/ui/ProductCard'
import PromoBanner from '@/components/ui/PromoBanner'
import { QuantityStepper } from '@/components/ui/Stepper'
import useCart, { useCartStore } from '@/store/cartStore'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { validateCoupon, getProducts, getPublicPromoSettings } from '@/services/api'

const QUICK_CATEGORIES = [
  { slug: 'fish', label: 'Fish', icon: 'set_meal' },
  { slug: 'prawns-shrimp', label: 'Prawns & Shrimp', icon: 'water' },
  { slug: 'crabs', label: 'Crabs', icon: 'bug_report' },
  { slug: 'lobster', label: 'Lobster', icon: 'water' },
  { slug: 'dried-fish', label: 'Dried Fish', icon: 'wb_sunny' },
  { slug: 'combos', label: 'Combos', icon: 'inventory_2' },
]

export default function Cart() {
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    discount,
    total,
    coupon,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    addItem,
  } = useCart()
  const { addToast } = useToastStore()
  const user = useAuthStore((s) => s.user)

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [showCouponInput, setShowCouponInput] = useState(true)
  const [removedItem, setRemovedItem] = useState(null)
  const [recentOrder, setRecentOrder] = useState(null)
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    if (items.length === 0) {
      const orderId = sessionStorage.getItem('justCompletedOrderId')
      if (orderId) {
        setRecentOrder(orderId)
        sessionStorage.removeItem('justCompletedOrderId')
      }
    }
  }, [items.length])

  // When the basket is empty, pull a few products to help the customer
  // start shopping again instead of staring at a blank page.
  useEffect(() => {
    if (items.length === 0) {
      getProducts()
        .then((productsData) => {
          if (Array.isArray(productsData) && productsData.length > 0) {
            const featured = productsData.filter((p) => p.isBestSeller)
            setRecommended((featured.length > 0 ? featured : productsData).slice(0, 4))
          }
        })
        .catch(() => setRecommended([]))
    }
  }, [items.length])

  // Check if coupon input should be visible based on master toggle
  useEffect(() => {
    getPublicPromoSettings()
      .then((res) => {
        if (res.success && res.banner) {
          setShowCouponInput(res.banner.enabled)
        }
      })
      .catch((err) => console.error('Failed to load promo settings for cart', err))
  }, [])

  const handleRemove = (item) => {
    setRemovedItem({ ...item })
    removeItem(item.id, item.weight)
    addToast({
      message: `${item.name} removed from cart`,
      type: 'undo',
      duration: 4000,
      action: {
        label: 'Undo',
        onClick: () => {
          addItem({ id: item.id, name: item.name, image: item.image, weight: item.weight, price: item.price, quantity: item.quantity })
        },
      },
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const result = await validateCoupon(couponCode.trim(), subtotal)
    if (result.valid) {
      applyCoupon({ code: couponCode.toUpperCase(), discount: result.discount, description: result.description })
      addToast({ message: `🎉 Coupon applied! You saved ₹${result.discount}`, type: 'success' })
      setCouponCode('')
    } else {
      setCouponError(result.message)
    }
    setCouponLoading(false)
  }

  const handleCheckout = () => {
    const { user, setCartLoginPopupOpen, setPendingAction } = useAuthStore.getState()
    if (!user) {
      setPendingAction({ type: 'CHECKOUT' })
      setCartLoginPopupOpen(true)
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    if (recentOrder) {
      return (
        <div className="min-h-screen bg-surface-container-low">
          <div className="container-max py-12">
            <div className="max-w-lg mx-auto bg-white rounded-[24px] shadow-card p-8 text-center mb-12">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-success" style={{ fontSize: '40px' }} aria-hidden="true">
                  check_circle
                </span>
              </div>
              <h1 className="text-headline-md text-on-surface mb-2">Order Placed Successfully!</h1>
              <p className="text-body-md text-on-surface-variant mb-6">
                Your order has been received and is being prepared for delivery.
              </p>

              {/* Order ID - copyable, so it never feels "lost" */}
              <div className="bg-surface-container-low rounded-2xl px-4 py-3 flex items-center justify-between mb-6 border border-outline-variant/40">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-0.5">Your Order ID</p>
                  <p className="font-mono font-black text-lg text-primary">{recentOrder}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(recentOrder)
                    addToast({ message: '📋 Order ID copied!', type: 'success' })
                  }}
                  className="text-primary hover:bg-primary/5 p-2 rounded-full transition-colors flex items-center"
                  title="Copy Order ID"
                  aria-label="Copy Order ID"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">content_copy</span>
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={() => navigate(`/orders/${recentOrder}`)}>
                  Track Order
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => navigate('/my-orders')}>
                  My Orders
                </Button>
              </div>
            </div>

            {recommended.length > 0 && (
              <div>
                <h2 className="text-headline-sm text-on-surface mb-5 text-center">Popular With Your Order</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommended.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-surface-container-low">
        <div className="container-max py-12">
          <div className="text-center max-w-md mx-auto mb-10">
            <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }} aria-hidden="true">
                shopping_cart
              </span>
            </div>
            <h1 className="text-headline-md text-on-surface mb-2">Your Sea Basket is Empty</h1>
            <p className="text-body-lg text-on-surface-variant mb-8">
              Dive in and discover today's freshest catches!
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button variant="primary" size="lg" onClick={() => navigate('/category/fish')}>
                Shop Now
              </Button>
              {user && (
                <Button variant="secondary" size="lg" onClick={() => navigate('/my-orders')}>
                  My Orders
                </Button>
              )}
            </div>
          </div>

          {/* Quick category browsing so the page has something to do besides "go back" */}
          <div className="max-w-3xl mx-auto mb-14">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {QUICK_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 bg-white rounded-[16px] shadow-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">{cat.icon}</span>
                  </span>
                  <span className="text-label-sm font-semibold text-on-surface text-center leading-tight">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended products to nudge the customer toward their first item */}
          {recommended.length > 0 && (
            <div>
              <h2 className="text-headline-sm text-on-surface mb-5 text-center">Today's Popular Catches</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recommended.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <PromoBanner />
      <div className="container-max py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" aria-label="Back to home">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" style={{ fontSize: '24px' }} aria-hidden="true">arrow_back</span>
          </Link>
          <h1 className="text-display-lg-mobile text-on-surface flex-1">
            Your Sea Basket
            <span className="ml-2 text-label-md text-on-surface-variant font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </h1>
          {user && (
            <Link
              to="/my-orders"
              className="hidden sm:flex items-center gap-1.5 text-label-md font-semibold text-primary hover:underline flex-shrink-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">receipt_long</span>
              My Orders
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.id}::${item.weight}`}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-[20px] shadow-card p-5 flex items-start gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-[12px] flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h2 className="text-label-md font-semibold text-on-surface hover:text-primary transition-colors truncate">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="text-label-sm text-on-surface-variant mb-3">{item.weight}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <QuantityStepper
                        value={item.quantity}
                        onIncrease={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                        onDecrease={() => {
                          if (item.quantity <= 1) handleRemove(item)
                          else updateQuantity(item.id, item.weight, item.quantity - 1)
                        }}
                      />
                      <div className="flex items-center gap-4">
                        <p className="text-headline-sm font-bold text-on-surface">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemove(item)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon (Hidden if master toggle is OFF) */}
            {showCouponInput && (
              <div className="bg-white rounded-[20px] shadow-card p-5">
                <h2 className="text-label-md font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }} aria-hidden="true">sell</span>
                  Apply Coupon
                </h2>
                {coupon ? (
                <div className="flex items-center justify-between bg-success/10 rounded-[12px] px-4 py-3">
                  <div>
                    <p className="text-label-md font-semibold text-success">{coupon.code}</p>
                    <p className="text-label-sm text-on-surface-variant">{coupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    aria-label="Remove coupon"
                    className="text-error hover:opacity-80"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">close</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Enter coupon code"
                      aria-label="Coupon code"
                      aria-invalid={!!couponError}
                      className="flex-1 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2.5 text-label-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none uppercase"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      loading={couponLoading}
                      disabled={!couponCode.trim()}
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p role="alert" className="text-label-sm text-error pl-2">{couponError}</p>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Price breakdown */}
            <div className="bg-white rounded-[20px] shadow-card p-5">
              <h2 className="text-label-md font-semibold text-on-surface mb-4">Order Summary</h2>
              <div className="space-y-3 text-body-md">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Items Subtotal</span>
                  <span className="font-semibold text-on-surface">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }} aria-hidden="true">check_circle</span>
                    FREE
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Coupon Savings</span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant pt-3 flex justify-between">
                  <span className="text-headline-sm font-bold text-on-surface">Grand Total</span>
                  <span className="text-headline-sm font-black text-on-surface">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-5"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}