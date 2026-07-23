import { Navigate, Outlet } from 'react-router-dom'
import useAdminAuthStore from '@/store/adminAuthStore'

export default function ProtectedAdminRoute() {
  const admin = useAdminAuthStore((s) => s.admin)

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
