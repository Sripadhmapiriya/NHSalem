import { useCartStore } from '@/store/cartStore'
import useAuthStore from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

function getHeaders(authRequired = false) {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (authRequired) {
    const token = useAuthStore.getState().token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

// Helper for fetch errors
async function handleResponse(response) {
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || 'Something went wrong')
  }
  return response.json()
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(opts = {}) {
  const params = new URLSearchParams()
  if (opts.category) params.append('category', opts.category)
  if (opts.search) params.append('search', opts.search)
  if (opts.sort) params.append('sort', opts.sort)

  if (opts.filters) {
    const { badges, minPrice, maxPrice } = opts.filters
    if (badges?.length) params.append('badges', badges.join(','))
    if (minPrice != null) params.append('minPrice', String(minPrice))
    if (maxPrice != null) params.append('maxPrice', String(maxPrice))
  }

  const response = await fetch(`${API_URL}/api/products?${params.toString()}`)
  return handleResponse(response)
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`)
  return handleResponse(response).catch(() => null)
}

export async function getProductBySlug(slug) {
  const response = await fetch(`${API_URL}/api/products/${slug}`)
  return handleResponse(response).catch(() => null)
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrderStatus(orderId) {
  const response = await fetch(`${API_URL}/api/orders/${orderId}`)
  return handleResponse(response).catch(() => null)
}

export async function getUserOrders() {
  const response = await fetch(`${API_URL}/api/orders/mine`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}


export async function placeOrder(data) {
  const couponCode = useCartStore.getState().coupon?.code
  const payload = {
    items: data.items.map((i) => ({
      productId: i.id,
      weight: i.weight,
      quantity: i.quantity
    })),
    address: data.address,
    slot: data.slot,
    paymentMethod: data.paymentMethod === 'upi' || data.paymentMethod === 'card' || data.paymentMethod === 'razorpay' ? 'razorpay' : 'cod', // map client 'upi'/'card' to server 'razorpay'
    couponCode: couponCode || null,
    razorpayOrderId: data.razorpayOrderId || null,
    razorpayPaymentId: data.razorpayPaymentId || null,
    razorpaySignature: data.razorpaySignature || null
  }

  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  })
  return handleResponse(response)
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export async function checkDelivery(pincode) {
  const response = await fetch(`${API_URL}/api/cities/${pincode}`)
  return handleResponse(response)
}

export async function validateCoupon(code, orderTotal) {
  const response = await fetch(`${API_URL}/api/promotions/validate?code=${encodeURIComponent(code)}&orderTotal=${orderTotal}`)
  return handleResponse(response)
}

// ── B2B ───────────────────────────────────────────────────────────────────────

export async function submitBulkInquiry(data) {
  const response = await fetch(`${API_URL}/api/wholesale`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

// ── Store Locator ─────────────────────────────────────────────────────────────

export async function getCities() {
  const response = await fetch(`${API_URL}/api/cities`)
  return handleResponse(response)
}

export async function getCityByPincode(pincode) {
  const response = await fetch(`${API_URL}/api/cities/${pincode}`)
  const data = await handleResponse(response).catch(() => null)
  if (data && data.available) {
    return { name: data.city, pincode, status: 'live', slots: data.slots }
  }
  return null
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getSubscriptionPlans() {
  const response = await fetch(`${API_URL}/api/subscriptions/plans`)
  return handleResponse(response)
}

export async function createSubscription(data) {
  const payload = {
    planId: data.planId,
    address: data.address
  }
  const response = await fetch(`${API_URL}/api/subscriptions`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  })
  return handleResponse(response)
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOTP(phone) {
  // Call backend OTP stub endpoint (always returns success)
  const response = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ phone })
  })
  return handleResponse(response).catch(() => ({ success: true, message: `OTP sent to +91 ${phone}` }))
}

export async function verifyOTP(phone, otp) {
  // Call backend OTP stub endpoint
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ phone, otp })
  })
  return handleResponse(response).catch(() => ({
    success: false,
    message: 'Invalid OTP. Please try again.'
  }))
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email })
  })
  return handleResponse(response)
}

// ── Help ──────────────────────────────────────────────────────────────────────

export async function getFAQs(search = '') {
  const response = await fetch(`${API_URL}/api/faqs?search=${encodeURIComponent(search)}`)
  return handleResponse(response)
}

// ── User Auth (Email + Password) ──────────────────────────────────────────────

export async function loginWithEmail(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    })
    return await handleResponse(response)
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function loginWithPhone(phone, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ phone, password })
    })
    return await handleResponse(response)
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function registerUser({ name, email, phone, password }) {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, phone, password })
    })
    return await handleResponse(response)
  } catch (err) {
    return { success: false, message: err.message }
  }
}

// ── Reviews (for Products Detail Page) ──────────────────────────────────────────

export async function getReviewsForProduct(productId) {
  const response = await fetch(`${API_URL}/api/products/${productId}/reviews`)
  return handleResponse(response)
}

export async function addProductReview(productId, reviewData) {
  const response = await fetch(`${API_URL}/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(reviewData)
  })
  return handleResponse(response)
}

// ── Recipes ───────────────────────────────────────────────────────────────────

export async function getRecipes() {
  const response = await fetch(`${API_URL}/api/recipes`)
  return handleResponse(response)
}

export async function getRecipeBySlug(slug) {
  const response = await fetch(`${API_URL}/api/recipes/${slug}`)
  return handleResponse(response)
}
