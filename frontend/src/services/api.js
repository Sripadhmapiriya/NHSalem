/**
 * services/api.js — API-shaped service layer
 *
 * All functions resolve mock data with simulated ~400ms latency.
 * In Phase 2, ONLY the implementation of these functions changes —
 * components/pages never need to be updated.
 *
 * Pattern: await delay(400) → return mock data
 */

import PRODUCTS from '@/mock/products'
import ORDERS from '@/mock/orders'
import CITIES from '@/mock/cities'
import FAQS from '@/mock/faqs'
import SUBSCRIPTION_PLANS from '@/mock/subscriptions'
import COUPONS from '@/mock/coupons'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * @param {{ category?: string, search?: string, filters?: object, sort?: string }} opts
 * @returns {Promise<Product[]>}
 */
export async function getProducts(opts = {}) {
  await delay(400)
  let results = [...PRODUCTS]

  if (opts.category) {
    results = results.filter((p) => p.category === opts.category)
  }

  if (opts.search) {
    const q = opts.search.toLowerCase()
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    )
  }

  if (opts.filters) {
    const { badges, minPrice, maxPrice } = opts.filters
    if (badges?.length) {
      results = results.filter((p) =>
        p.badges?.some((b) => badges.includes(b.type))
      )
    }
    if (minPrice != null) results = results.filter((p) => p.basePrice >= minPrice)
    if (maxPrice != null) results = results.filter((p) => p.basePrice <= maxPrice)
  }

  if (opts.sort === 'price_asc') results.sort((a, b) => a.basePrice - b.basePrice)
  else if (opts.sort === 'price_desc') results.sort((a, b) => b.basePrice - a.basePrice)
  else if (opts.sort === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else if (opts.sort === 'newest') results.sort((a, b) => b.id.localeCompare(a.id))

  return results
}

/**
 * @param {string} id
 * @returns {Promise<Product|null>}
 */
export async function getProductById(id) {
  await delay(300)
  return PRODUCTS.find((p) => p.id === id || p.slug === id) || null
}

/**
 * @param {string} slug
 * @returns {Promise<Product|null>}
 */
export async function getProductBySlug(slug) {
  await delay(300)
  return PRODUCTS.find((p) => p.slug === slug) || null
}

// ── Orders ────────────────────────────────────────────────────────────────────

/**
 * @param {string} orderId
 * @returns {Promise<Order|null>}
 */
export async function getOrderStatus(orderId) {
  await delay(500)
  return ORDERS[orderId] || null
}

/**
 * @param {{ items: CartItem[], address: Address, slot: string, paymentMethod: string }} data
 * @returns {Promise<{ orderId: string }>}
 */
export async function placeOrder(data) {
  await delay(1200)
  const orderId = `NHS-${Math.floor(10000 + Math.random() * 90000)}`
  // Store in mock ORDERS for tracking
  ORDERS[orderId] = {
    id: orderId,
    status: 'confirmed',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    eta: 'Arriving in ~3 hours',
    address: data.address,
    items: data.items,
    subtotal: data.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    shipping: 0,
    total: data.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    freshnessScore: 95,
    catchTime: '2h ago',
    stages: [
      { id: 'confirmed', label: 'Confirmed', icon: 'check_circle', completedAt: new Date().toISOString() },
      { id: 'packed', label: 'Packed on Ice', icon: 'ac_unit', completedAt: null },
      { id: 'out_for_delivery', label: 'Out for Delivery', icon: 'local_shipping', completedAt: null },
      { id: 'delivered', label: 'Delivered', icon: 'home', completedAt: null },
    ],
  }
  return { orderId }
}

// ── Checkout ──────────────────────────────────────────────────────────────────

/**
 * Validate pincode for delivery availability
 * @param {string} pincode
 */
export async function checkDelivery(pincode) {
  await delay(600)
  const city = CITIES.find((c) => c.pincode === pincode && c.status === 'live')
  if (city) {
    return {
      available: true,
      city: city.name,
      slots: city.slots,
      message: `Delivery available to ${city.name}! Choose your slot.`,
    }
  }
  return {
    available: false,
    message: `We don't deliver to ${pincode} yet. Coming soon!`,
  }
}

/**
 * Validate a coupon code
 * @param {string} code
 * @param {number} orderTotal
 */
export async function validateCoupon(code, orderTotal) {
  await delay(400)
  const coupon = COUPONS[code?.toUpperCase()]
  if (!coupon) return { valid: false, message: 'Invalid coupon code' }
  if (orderTotal < coupon.minOrder)
    return { valid: false, message: `Minimum order ₹${coupon.minOrder} required` }
  let discount = 0
  if (coupon.type === 'flat') discount = coupon.discount
  else if (coupon.type === 'percent') discount = Math.round((orderTotal * coupon.discount) / 100)
  return { valid: true, discount, description: coupon.description }
}

// ── B2B ───────────────────────────────────────────────────────────────────────

/**
 * @param {{ businessName, contactName, email, industry, specifications }} data
 */
export async function submitBulkInquiry(data) {
  await delay(800)
  console.log('[Mock] Bulk inquiry received:', data)
  return { success: true, referenceId: `B2B-${Date.now()}` }
}

// ── Store Locator ─────────────────────────────────────────────────────────────

export async function getCities() {
  await delay(300)
  return CITIES
}

export async function getCityByPincode(pincode) {
  await delay(400)
  return CITIES.find((c) => c.pincode === pincode) || null
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getSubscriptionPlans() {
  await delay(300)
  return SUBSCRIPTION_PLANS
}

export async function createSubscription(data) {
  await delay(1000)
  return { success: true, subscriptionId: `SUB-${Date.now()}` }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOTP(phone) {
  await delay(800)
  console.log(`[Mock] OTP sent to ${phone}: 123456`)
  return { success: true, message: `OTP sent to +91 ${phone}` }
}

export async function verifyOTP(phone, otp) {
  await delay(600)
  // Mock: any 6-digit OTP starting with 1 works (or exactly "123456")
  if (otp === '123456' || (otp.length === 6 && otp.startsWith('1'))) {
    return {
      success: true,
      user: {
        id: 'u1',
        name: 'Karthik Rajan',
        phone,
        email: 'karthik@example.com',
      },
      token: 'mock-jwt-token',
    }
  }
  return { success: false, message: 'Invalid OTP. Please try again.' }
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  await delay(500)
  return { success: true, message: `${email} subscribed successfully!` }
}

// ── Help ──────────────────────────────────────────────────────────────────────

export async function getFAQs(search = '') {
  await delay(200)
  if (!search) return FAQS
  const q = search.toLowerCase()
  return FAQS.filter(
    (f) => f.title.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)
  )
}

// ── User Auth (Email + Password) ──────────────────────────────────────────────

/**
 * Log in with email + password.
 * Mock credentials: user@nhsalem.com / password123
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, token?: string, message?: string }>}
 */
export async function loginWithEmail(email, password) {
  await delay(800)

  // Mock valid credential
  if (
    email.toLowerCase().trim() === 'user@nhsalem.com' &&
    password === 'password123'
  ) {
    return {
      success: true,
      user: {
        id: 'u1',
        name: 'NH Salem User',
        email: 'user@nhsalem.com',
        phone: '9876543210',
      },
      token: 'mock-user-jwt-email',
    }
  }

  return {
    success: false,
    message: 'Invalid email or password. Please try again.',
  }
}

/**
 * Log in with phone number + password.
 * Mock credentials: 9876543210 / password123
 *
 * @param {string} phone  10-digit number
 * @param {string} password
 * @returns {Promise<{ success: boolean, user?: object, token?: string, message?: string }>}
 */
export async function loginWithPhone(phone, password) {
  await delay(800)

  // Mock valid credential
  if (phone === '9876543210' && password === 'password123') {
    return {
      success: true,
      user: {
        id: 'u1',
        name: 'NH Salem User',
        email: 'user@nhsalem.com',
        phone: '9876543210',
      },
      token: 'mock-user-jwt-phone',
    }
  }

  return {
    success: false,
    message: 'Invalid phone number or password. Please try again.',
  }
}

