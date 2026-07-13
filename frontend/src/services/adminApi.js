import useAdminAuthStore from '@/store/adminAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function getHeaders(authRequired = true) {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (authRequired) {
    const token = useAdminAuthStore.getState().token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}

async function handleResponse(response) {
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || 'Something went wrong')
  }
  return response.json()
}

// ── Admin Auth ────────────────────────────────────────────────────────────────

export async function adminLogin(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    })
    return await handleResponse(response)
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export async function adminLogout() {
  return { success: true }
}

export async function verifyAdminSession(token) {
  try {
    const response = await fetch(`${API_URL}/api/admin/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await handleResponse(response)
    return { valid: true, admin: data.admin }
  } catch (err) {
    return { valid: false }
  }
}

// ── Admin Dashboard Statistics ────────────────────────────────────────────────

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Customers ───────────────────────────────────────────────────────────

export async function getCustomers() {
  const response = await fetch(`${API_URL}/api/admin/customers`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Products CRUD ───────────────────────────────────────────────────────

export async function createAdminProduct(data) {
  const response = await fetch(`${API_URL}/api/admin/products`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function updateAdminProduct(id, data) {
  const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function deleteAdminProduct(id) {
  const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Promotions CRUD ─────────────────────────────────────────────────────

export async function getAdminPromotions() {
  const response = await fetch(`${API_URL}/api/admin/promotions`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function createAdminPromotion(data) {
  const response = await fetch(`${API_URL}/api/admin/promotions`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function updateAdminPromotion(id, data) {
  const response = await fetch(`${API_URL}/api/admin/promotions/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function deleteAdminPromotion(id) {
  const response = await fetch(`${API_URL}/api/admin/promotions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Subscriptions & Plans CRUD ──────────────────────────────────────────

export async function getAdminPlans() {
  const response = await fetch(`${API_URL}/api/admin/subscriptions/plans`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function createAdminPlan(data) {
  const response = await fetch(`${API_URL}/api/admin/subscriptions/plans`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function updateAdminPlan(id, data) {
  const response = await fetch(`${API_URL}/api/admin/subscriptions/plans/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function deleteAdminPlan(id) {
  const response = await fetch(`${API_URL}/api/admin/subscriptions/plans/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Orders ──────────────────────────────────────────────────────────────

export async function getAdminOrders() {
  const response = await fetch(`${API_URL}/api/admin/orders`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function getAdminOrder(id) {
  const response = await fetch(`${API_URL}/api/admin/orders/${id}`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function updateAdminOrderStatus(id, status) {
  const response = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ status })
  })
  return handleResponse(response)
}

// ── Admin Wholesale Inquiries ─────────────────────────────────────────────────

export async function getAdminWholesale() {
  const response = await fetch(`${API_URL}/api/admin/wholesale`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function createAdminWholesale(data) {
  const response = await fetch(`${API_URL}/api/admin/wholesale`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function updateAdminWholesale(id, data) {
  const response = await fetch(`${API_URL}/api/admin/wholesale/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function deleteAdminWholesale(id) {
  const response = await fetch(`${API_URL}/api/admin/wholesale/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Reviews ─────────────────────────────────────────────────────────────

export async function getAdminReviews() {
  const response = await fetch(`${API_URL}/api/admin/reviews`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function updateAdminReviewStatus(id, status) {
  const response = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ status })
  })
  return handleResponse(response)
}

export async function deleteAdminReview(id) {
  const response = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

// ── Admin Recipes CRUD ────────────────────────────────────────────────────────

export async function getAdminRecipes() {
  const response = await fetch(`${API_URL}/api/admin/recipes`, {
    headers: getHeaders(true)
  })
  return handleResponse(response)
}

export async function createAdminRecipe(data) {
  const response = await fetch(`${API_URL}/api/admin/recipes`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function updateAdminRecipe(id, data) {
  const response = await fetch(`${API_URL}/api/admin/recipes/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(data)
  })
  return handleResponse(response)
}

export async function deleteAdminRecipe(id) {
  const response = await fetch(`${API_URL}/api/admin/recipes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true)
  })
  return handleResponse(response)
}
