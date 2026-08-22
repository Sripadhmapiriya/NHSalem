import { useCartStore } from '@/store/cartStore'
import useAuthStore from '@/store/authStore'

export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads')) return `${API_URL}${path}`
  return path
}

function getHeaders(authRequired = false) {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (authRequired) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nh-salem-token') : null
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

// Helper for fetch errors
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || 'An error occurred')
  }
  let data = await response.json()
  
  // Intercept and rewrite legacy localhost image URLs from DB to point to current API_URL
  if (API_URL && !API_URL.includes('localhost')) {
    const jsonStr = JSON.stringify(data).replace(/http:\/\/localhost:\d+/g, API_URL)
    data = JSON.parse(jsonStr)
  }
  
  return data
}

// ==========================================
// Public/Customer Contact Form
// ==========================================
export const submitContactMessage = async (data) => {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(data)
  })
  return handleResponse(res)
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`)
  return handleResponse(response)
}

export async function updateCategoryThumbnail(id, category_thumbnail) {
  const res = await fetch(`${API_URL}/api/categories/${id}/thumbnail`, {
    method: 'PATCH',
    headers: { ...getHeaders(true) }, // Requires Admin auth
    body: JSON.stringify({ category_thumbnail })
  })
  return handleResponse(res)
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(opts = {}) {
  const params = new URLSearchParams()
  if (opts.category) params.append('category', opts.category)
  if (opts.search) params.append('search', opts.search)
  if (opts.sort) params.append('sort', opts.sort)

  if (opts.filters) {
    const { minPrice, maxPrice } = opts.filters
    if (minPrice !== undefined) params.append('minPrice', String(minPrice))
    if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice))
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
  const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
    headers: getHeaders(true)
  })
  return handleResponse(response).catch(() => null)
}

export async function getUserOrders() {
  const response = await fetch(`${API_URL}/api/orders/mine`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function getMyOrders() {
  const response = await fetch(`${API_URL}/api/orders/my-orders`, {
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

export async function getPublicPromoSettings() {
  const response = await fetch(`${API_URL}/api/settings/promotions`)
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

export async function registerCityNotification(email, cityId) {
  const response = await fetch(`${API_URL}/api/cities/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, cityId })
  })
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

export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email })
  })
  return handleResponse(response).catch((err) => ({ success: false, message: err.message }))
}

export async function resetPassword(email, otp, newPassword) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email, otp, newPassword })
  })
  return handleResponse(response).catch((err) => ({ success: false, message: err.message }))
}


// ── Help ──────────────────────────────────────────────────────────────────────

export async function getFAQs(search = '') {
  const response = await fetch(`${API_URL}/api/faqs?search=${encodeURIComponent(search)}`)
  return handleResponse(response)
}

// ── User Auth (Email + Password) ──────────────────────────────────────────────

export async function verifySession(token) {
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await handleResponse(response)
    return { valid: true, user: data.user }
  } catch (err) {
    return { valid: false }
  }
}

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

export async function subscribeNewsletter(email) {
  const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ email })
  })
  return handleResponse(response)
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

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getApprovedSiteReviews() {
  try {
    const response = await fetch(`${API_URL}/api/reviews`)
    return await handleResponse(response)
  } catch (e) {
    return { success: false, reviews: [] }
  }
}

export async function submitSiteReview(reviewData) {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(reviewData)
  })
  return handleResponse(response)
}

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

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getUserAddresses() {
  const response = await fetch(`${API_URL}/api/addresses`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function createUserAddress(addressData) {
  const response = await fetch(`${API_URL}/api/addresses`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(addressData)
  })
  return handleResponse(response)
}

export async function deleteUserAddress(id) {
  const response = await fetch(`${API_URL}/api/addresses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist() {
  const response = await fetch(`${API_URL}/api/wishlist`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function toggleWishlistApi(productId) {
  const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ productId })
  })
  return handleResponse(response)
}
