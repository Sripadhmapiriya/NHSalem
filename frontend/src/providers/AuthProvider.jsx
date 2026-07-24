import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import useAdminAuthStore from '@/store/adminAuthStore'
import { verifySession } from '@/services/api'
import { verifyAdminSession } from '@/services/adminApi'
import { SeafoodLoader } from '@/components/ui'

export default function AuthProvider({ children }) {
  const [isBooting, setIsBooting] = useState(true)
  const [error, setError] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const bootApp = async () => {
      setError(false)
      
      const customerToken = localStorage.getItem('nh-salem-token')
      const adminToken = localStorage.getItem('nh-salem-admin-token')

      const promises = []

      // 1. Verify Admin Session if token exists
      if (adminToken) {
        // Optimistically populate UI with cached user
        try {
          const cachedAdmin = localStorage.getItem('nh-salem-admin')
          if (cachedAdmin) {
            useAdminAuthStore.getState().setAdmin(JSON.parse(cachedAdmin), adminToken)
          }
        } catch (_) {}

        promises.push(
          verifyAdminSession(adminToken)
            .then(res => {
              if (res.valid) {
                useAdminAuthStore.getState().setAdmin(res.admin, adminToken)
              } else {
                useAdminAuthStore.getState().logout()
              }
            })
            .catch(err => {
              console.error('Admin session verification failed:', err)
              useAdminAuthStore.getState().logout()
            })
        )
      } else {
        useAdminAuthStore.getState().logout()
      }

      // 2. Verify Customer Session if token exists
      if (customerToken) {
        // Optimistically populate UI with cached user
        try {
          const cachedUser = localStorage.getItem('nh-salem-user')
          if (cachedUser) {
            useAuthStore.getState().setUser(JSON.parse(cachedUser), customerToken)
          }
        } catch (_) {}

        promises.push(
          verifySession(customerToken)
            .then(res => {
              if (res.valid) {
                useAuthStore.getState().setUser(res.user, customerToken)
              } else {
                useAuthStore.getState().logout()
              }
            })
            .catch(err => {
              console.error('Customer session verification failed:', err)
              useAuthStore.getState().logout()
            })
        )
      } else {
        useAuthStore.getState().logout()
      }

      // Wait for all verification promises to resolve, or timeout after 8s
      try {
        if (promises.length > 0) {
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Session verification timed out')), 8000))
          await Promise.race([Promise.all(promises), timeoutPromise])
        }
      } catch (err) {
        console.error('Auth verification error/timeout:', err)
        setError(true)
      } finally {
        useAuthStore.getState().setAppReady(true)
        useAdminAuthStore.getState().setAdminAppReady(true)
        setIsBooting(false)
      }
    }

    bootApp()
  }, [])

  if (error) {
    const isAdmin = location.pathname.startsWith('/admin')
    
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-admin-seafoam flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full border border-red-200">
            <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Session Error</h3>
            <p className="text-sm text-gray-600 mb-4">We couldn't verify your admin session. Please try logging in again.</p>
            <button
              onClick={() => {
                useAdminAuthStore.getState().logout()
                window.location.reload()
              }}
              className="w-full py-2 bg-admin-navy text-white rounded-lg font-medium hover:bg-admin-navy/90 transition"
            >
              Log Out & Retry
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-stat text-center max-w-sm w-full border border-red-100">
          <span className="material-symbols-outlined text-red-500 text-4xl mb-3">gpp_maybe</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">Session Error</h3>
          <p className="text-sm text-on-surface-variant mb-5">There was a problem verifying your secure session. Please try again.</p>
          <button
            onClick={() => {
              useAuthStore.getState().logout()
              window.location.reload()
            }}
            className="w-full py-2.5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition shadow-sm"
          >
            Log Out & Retry
          </button>
        </div>
      </div>
    )
  }

  if (isBooting) {
    const isAdmin = location.pathname.startsWith('/admin')
    
    if (isAdmin) {
      return (
        <div className="min-h-screen bg-admin-seafoam flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-admin-navy border-t-admin-gold rounded-full animate-spin" />
        </div>
      )
    }

    return <SeafoodLoader text="Verifying session…" className="min-h-screen" />
  }

  return children
}
