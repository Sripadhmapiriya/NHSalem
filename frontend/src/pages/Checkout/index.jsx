import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import { ProgressStepper } from '@/components/ui/Stepper'
import Chip from '@/components/ui/Chip'
import Input from '@/components/ui/Input'
import useCart from '@/store/cartStore'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { placeOrder } from '@/services/api'

const CHECKOUT_STEPS = [
  { id: 'address', label: 'Delivery Address', icon: 'location_on' },
  { id: 'slot', label: 'Delivery Slot', icon: 'schedule' },
  { id: 'payment', label: 'Payment', icon: 'payment' },
  { id: 'summary', label: 'Order Summary', icon: 'receipt' },
]

const SAVED_ADDRESSES = [
  { id: 'addr1', label: 'Home', name: 'Karthik Rajan', line1: '42, Gandhi Nagar, 3rd Cross', city: 'Bangalore', state: 'Karnataka', pincode: '560038', phone: '+91 98765 43210' },
]

const DELIVERY_SLOTS = ['7–9 AM', '9–11 AM', '11 AM–1 PM', '5–7 PM', '7–9 PM']

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: 'qr_code', description: 'GPay, PhonePe, BHIM, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card', description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: 'account_balance', description: 'All major banks supported' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'payments', description: 'Pay when your order arrives (up to ₹5,000)' },
]

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  line1: z.string().min(5, 'Enter a complete address'),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(2, 'Enter your state'),
})

const upiSchema = z.object({
  upiId: z.string().regex(/^[\w.-]+@[\w]+$/, 'Enter a valid UPI ID (e.g. name@upi)'),
})

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [user, navigate])

  const { items, subtotal, discount, total, clearCart } = useCart()
  const { addToast } = useToastStore()

  const [step, setStep] = useState('address')
  const [selectedAddress, setSelectedAddress] = useState('addr1')
  const [addingAddress, setAddingAddress] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [placingOrder, setPlacingOrder] = useState(false)

  const addressForm = useForm({ resolver: zodResolver(addressSchema) })
  const upiForm = useForm({ resolver: zodResolver(upiSchema) })

  const currentAddress = SAVED_ADDRESSES.find((a) => a.id === selectedAddress)

  const handleNextFromAddress = () => {
    if (!selectedAddress && !addingAddress) return
    setStep('slot')
  }

  const handleNextFromSlot = () => {
    if (!selectedSlot) {
      addToast({ message: 'Please select a delivery slot', type: 'warning' })
      return
    }
    setStep('payment')
  }

  const handleNextFromPayment = () => {
    if (!selectedPayment) {
      addToast({ message: 'Please select a payment method', type: 'warning' })
      return
    }
    if (selectedPayment === 'upi') {
      upiForm.handleSubmit(() => setStep('summary'))()
      return
    }
    setStep('summary')
  }

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    try {
      const { orderId } = await placeOrder({
        items,
        address: currentAddress || addressForm.getValues(),
        slot: selectedSlot,
        paymentMethod: selectedPayment,
      })
      clearCart()
      addToast({ message: '🎉 Order placed successfully!', type: 'success', duration: 5000 })
      navigate(`/orders/${orderId}`)
    } catch {
      addToast({ message: 'Something went wrong. Please try again.', type: 'error' })
    } finally {
      setPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-8">
      <div className="container-max max-w-5xl">
        <h1 className="text-display-lg-mobile text-on-surface mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="bg-white rounded-[20px] shadow-card p-6 mb-8">
          <ProgressStepper steps={CHECKOUT_STEPS} currentStep={step} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: Address */}
              {step === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-headline-sm text-on-surface">Select Delivery Address</h2>

                  {/* Saved addresses */}
                  {SAVED_ADDRESSES.map((addr) => (
                    <label
                      key={addr.id}
                      htmlFor={`addr-${addr.id}`}
                      className={`flex items-start gap-4 bg-white rounded-[20px] shadow-card p-5 cursor-pointer border-2 transition-all ${
                        selectedAddress === addr.id && !addingAddress
                          ? 'border-primary'
                          : 'border-transparent hover:border-outline-variant'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`addr-${addr.id}`}
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id && !addingAddress}
                        onChange={() => { setSelectedAddress(addr.id); setAddingAddress(false) }}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-label-md font-bold text-on-surface">{addr.name}</span>
                          <span className="px-2 py-0.5 bg-surface-container rounded-full text-label-sm text-on-surface-variant">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-body-md text-on-surface-variant">{addr.line1}, {addr.city}, {addr.state} — {addr.pincode}</p>
                        <p className="text-label-sm text-on-surface-variant mt-0.5">{addr.phone}</p>
                      </div>
                    </label>
                  ))}

                  {/* Add new address */}
                  <button
                    onClick={() => { setAddingAddress(true); setSelectedAddress(null) }}
                    className={`w-full flex items-center gap-4 bg-white rounded-[20px] p-5 border-2 border-dashed transition-all ${
                      addingAddress ? 'border-primary' : 'border-outline-variant hover:border-primary'
                    }`}
                    aria-expanded={addingAddress}
                  >
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }} aria-hidden="true">add_location</span>
                    <span className="text-label-md font-semibold text-primary">Add New Address</span>
                  </button>

                  {addingAddress && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-white rounded-[20px] shadow-card p-6 space-y-4 overflow-hidden"
                    >
                      <Input label="Full Name" id="new-name" required {...addressForm.register('name')} error={addressForm.formState.errors.name?.message} />
                      <Input label="Mobile Number" id="new-phone" type="tel" required {...addressForm.register('phone')} error={addressForm.formState.errors.phone?.message} />
                      <Input label="Pincode" id="new-pincode" required {...addressForm.register('pincode')} error={addressForm.formState.errors.pincode?.message} />
                      <Input label="Address Line 1" id="new-line1" required {...addressForm.register('line1')} error={addressForm.formState.errors.line1?.message} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="City" id="new-city" required {...addressForm.register('city')} error={addressForm.formState.errors.city?.message} />
                        <Input label="State" id="new-state" required {...addressForm.register('state')} error={addressForm.formState.errors.state?.message} />
                      </div>
                    </motion.div>
                  )}

                  <Button variant="primary" className="w-full" onClick={addingAddress ? addressForm.handleSubmit(handleNextFromAddress) : handleNextFromAddress}>
                    Continue to Delivery Slot
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: Slot */}
              {step === 'slot' && (
                <motion.div
                  key="slot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-headline-sm text-on-surface">Preferred Delivery Slot</h2>
                  <p className="text-body-md text-on-surface-variant">
                    Select a delivery time window for today. All slots include our cold-chain guarantee.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DELIVERY_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={selectedSlot === slot}
                        className={`p-4 rounded-[16px] border-2 text-label-md font-semibold transition-all ${
                          selectedSlot === slot
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-white text-on-surface border-outline-variant hover:border-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined block mb-1" style={{ fontSize: '20px' }} aria-hidden="true">schedule</span>
                        {slot}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep('address')}>Back</Button>
                    <Button variant="primary" className="flex-1" onClick={handleNextFromSlot}>Continue to Payment</Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-headline-sm text-on-surface">Payment Method</h2>
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id}>
                      <label
                        htmlFor={`pay-${method.id}`}
                        className={`flex items-center gap-4 bg-white rounded-[20px] shadow-card p-5 cursor-pointer border-2 transition-all ${
                          selectedPayment === method.id ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                        }`}
                      >
                        <input
                          type="radio"
                          id={`pay-${method.id}`}
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="accent-primary"
                        />
                        <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }} aria-hidden="true">{method.icon}</span>
                        </div>
                        <div>
                          <p className="text-label-md font-semibold text-on-surface">{method.label}</p>
                          <p className="text-label-sm text-on-surface-variant">{method.description}</p>
                        </div>
                      </label>
                      {/* UPI ID field */}
                      {selectedPayment === 'upi' && method.id === 'upi' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-2 px-4 overflow-hidden"
                        >
                          <Input
                            label="UPI ID"
                            id="upi-id"
                            placeholder="name@upi"
                            required
                            {...upiForm.register('upiId')}
                            error={upiForm.formState.errors.upiId?.message}
                          />
                        </motion.div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep('slot')}>Back</Button>
                    <Button variant="primary" className="flex-1" onClick={handleNextFromPayment}>Review Order</Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Summary */}
              {step === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h2 className="text-headline-sm text-on-surface">Review Your Order</h2>

                  {/* Items */}
                  <div className="bg-white rounded-[20px] shadow-card p-5 space-y-3">
                    {items.map((item) => (
                      <div key={`${item.id}::${item.weight}`} className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-[10px] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-label-md font-semibold text-on-surface">{item.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{item.weight} × {item.quantity}</p>
                        </div>
                        <p className="text-label-md font-bold text-on-surface">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery details */}
                  <div className="bg-white rounded-[20px] shadow-card p-5 space-y-2 text-body-md">
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }} aria-hidden="true">location_on</span>
                      <div>
                        <p className="font-semibold text-on-surface">{currentAddress?.name}</p>
                        <p className="text-on-surface-variant">{currentAddress?.line1}, {currentAddress?.city} {currentAddress?.pincode}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }} aria-hidden="true">schedule</span>
                      <p className="text-on-surface">{selectedSlot}</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }} aria-hidden="true">payment</span>
                      <p className="text-on-surface">{PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep('payment')}>Back</Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      loading={placingOrder}
                      onClick={handlePlaceOrder}
                    >
                      Place Order — ₹{total.toLocaleString()}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky order summary */}
          <div>
            <div className="sticky top-24 bg-white rounded-[20px] shadow-card p-5">
              <h2 className="text-label-md font-semibold text-on-surface mb-4">Order Summary</h2>
              <div className="space-y-3 text-body-md border-b border-outline-variant pb-4 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}::${item.weight}`} className="flex justify-between">
                    <span className="text-on-surface-variant truncate flex-1 pr-2">{item.name} × {item.quantity}</span>
                    <span className="font-semibold text-on-surface flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-body-md">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className="text-success font-semibold">FREE</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant pt-3 flex justify-between">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="font-black text-headline-sm text-on-surface">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
