import { Navigate, Outlet } from 'react-router-dom'
import useAdminAuthStore from '@/store/adminAuthStore'

/**
 * ProtectedAdminRoute — route guard for all admin-only pages.
 *
 * If admin is not logged in, redirects to /admin/login.
 * Otherwise renders nested routes via <Outlet />.
 *
 * Usage in router:
 *   <Route element={<ProtectedAdminRoute />}>
 *     <Route path="dashboard" element={<AdminDashboard />} />
 *     <Route path="orders"    element={<AdminOrders />} />
 *     ...
 *   </Route>
 */
export default function ProtectedAdminRoute() {
  const admin = useAdminAuthStore((s) => s.admin)

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
