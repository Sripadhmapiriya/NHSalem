import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import useAdminAuthStore from '@/store/adminAuthStore'
import { verifySession } from '@/services/api'
import { verifyAdminSession } from '@/services/adminApi'
import { SeafoodLoader } from '@/components/ui'

export default function AuthProvider({ children }) {
  const [isVerifying, setIsVerifying] = useState(true)
  const location = useLocation()

  // We read the tokens on first mount. 
  // Since Zustand's localStorage persist is synchronous, these are already hydrated.
  const token = useAuthStore.getState().token
  const adminToken = useAdminAuthStore.getState().token

  useEffect(() => {
    const verifyTokens = async () => {
      const isAdminRoute = location.pathname.startsWith('/admin')

      if (isAdminRoute) {
        // Admin validation
        if (adminToken) {
          const res = await verifyAdminSession(adminToken)
          if (!res.valid) {
            useAdminAuthStore.getState().logout()
          } else {
            // Update admin details in case they changed on the server
            useAdminAuthStore.getState().setAdmin(res.admin, adminToken)
          }
        }
      } else {
        // Customer validation
        if (token) {
          const res = await verifySession(token)
          if (!res.valid) {
            useAuthStore.getState().logout()
          } else {
            useAuthStore.getState().setUser(res.user, token)
          }
        }
      }

      setIsVerifying(false)
    }

    verifyTokens()
    
    // We only want this to run once when the app boots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isVerifying) {
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
