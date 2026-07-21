import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import { QuantityStepper } from '@/components/ui/Stepper'
import useCart, { useCartStore } from '@/store/cartStore'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { validateCoupon } from '@/services/api'

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

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [removedItem, setRemovedItem] = useState(null)

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: '48px' }} aria-hidden="true">
              shopping_cart
            </span>
          </div>
          <h1 className="text-headline-md text-on-surface mb-2">Your Sea Basket is Empty</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Dive in and discover today's freshest catches!
          </p>
          <Button variant="primary" onClick={() => navigate('/category/fish')}>
            Shop Now
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8">
      <div className="container-max">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" aria-label="Back to home">
            <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors" style={{ fontSize: '24px' }} aria-hidden="true">arrow_back</span>
          </Link>
          <h1 className="text-display-lg-mobile text-on-surface">
            Your Sea Basket
            <span className="ml-2 text-label-md text-on-surface-variant font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </h1>
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
            {/* Coupon */}
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
                  <p className="text-label-sm text-on-surface-variant">Try: WELCOME200, FISH20, NHSALEM10</p>
                </div>
              )}
            </div>

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
