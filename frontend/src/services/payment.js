import useAuthStore from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000')

function getHeaders(authRequired = true) {
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

async function handleResponse(response) {
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || 'Something went wrong')
  }
  return response.json()
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function createRazorpayOrder(amount) {
  const response = await fetch(`${API_URL}/api/payment/create-order`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ amount })
  })
  return handleResponse(response)
}

export async function verifyRazorpayPayment(paymentData) {
  const response = await fetch(`${API_URL}/api/payment/verify`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(paymentData)
  })
  return handleResponse(response)
}

export async function getRazorpayKey() {
  const response = await fetch(`${API_URL}/api/payment/key`, {
    headers: getHeaders(false)
  })
  return handleResponse(response)
}
