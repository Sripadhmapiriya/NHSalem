/**
 * services/adminApi.js — Admin-specific API service layer
 *
 * Mirrors the pattern of services/api.js: all functions return promises with
 * simulated latency so the UI loading states work end-to-end. In Phase 2,
 * replace the mock bodies with real HTTP calls; component code stays the same.
 *
 * Mock credentials: admin@nhsalem.com / admin123
 */

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

// ── Admin Auth ────────────────────────────────────────────────────────────────

/**
 * Log in as an admin.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, admin?: AdminUser, token?: string, message?: string }>}
 */
export async function adminLogin(email, password) {
  await delay(900)

  // Mock: single hardcoded admin credential
  if (
    email.toLowerCase().trim() === 'admin@nhsalem.com' &&
    password === 'admin123'
  ) {
    return {
      success: true,
      admin: {
        id: 'a1',
        name: 'Admin',
        email: 'admin@nhsalem.com',
        role: 'super_admin',
      },
      token: 'mock-admin-jwt-token',
    }
  }

  // Wrong credentials
  return {
    success: false,
    message: 'Invalid credentials. Please check your email and security key.',
  }
}

/**
 * Log out the current admin session (call any server-side invalidation here).
 */
export async function adminLogout() {
  await delay(200)
  return { success: true }
}

/**
 * Verify an existing admin token is still valid.
 * In production this would hit a /admin/me endpoint.
 * @param {string} token
 */
export async function verifyAdminSession(token) {
  await delay(300)
  if (token === 'mock-admin-jwt-token') {
    return {
      valid: true,
      admin: { id: 'a1', name: 'Admin', email: 'admin@nhsalem.com', role: 'super_admin' },
    }
  }
  return { valid: false }
}
