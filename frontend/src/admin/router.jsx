import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedAdminRoute from './ProtectedAdminRoute'
import AdminLayout from './AdminLayout'

// ── Lazy-load admin pages ─────────────────────────────────────────────────────
const AdminLogin        = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard    = lazy(() => import('@/pages/admin/Dashboard'))
const AdminOrders       = lazy(() => import('@/pages/admin/Orders'))
const AdminOrderDetail  = lazy(() => import('@/pages/admin/OrderDetail'))
const AdminProducts     = lazy(() => import('@/pages/admin/Products'))
const AdminAddEditProduct = lazy(() => import('@/pages/admin/AddEditProduct'))
const AdminCustomers    = lazy(() => import('@/pages/admin/Customers'))
const CustomerDetail    = lazy(() => import('@/pages/admin/CustomerDetail'))
const AdminPromotions   = lazy(() => import('@/pages/admin/Promotions'))
const AdminReviews      = lazy(() => import('@/pages/admin/Reviews'))
const AdminStoreLocator = lazy(() => import('@/pages/admin/StoreLocator'))
const AdminWholesale    = lazy(() => import('@/pages/admin/Wholesale'))

function AdminPageLoader() {
  return (
    <div className="min-h-screen bg-admin-seafoam flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-admin-navy border-t-admin-gold rounded-full animate-spin" />
        <p className="text-admin-text-sub text-sm font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  )
}

/**
 * AdminRoutes — all routes under /admin/* live here.
 * Structure:
 *   /admin/login          → Public (no layout)
 *   /admin/*              → ProtectedAdminRoute → AdminLayout → page
 */
export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="login" element={<AdminLogin />} />

        {/* Protected — wrapped in auth guard + persistent AdminLayout */}
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard"                 element={<AdminDashboard />} />
            <Route path="orders"                    element={<AdminOrders />} />
            <Route path="orders/:id"                element={<AdminOrderDetail />} />
            <Route path="products"                  element={<AdminProducts />} />
            <Route path="products/new"              element={<AdminAddEditProduct />} />
            <Route path="products/:id/edit"         element={<AdminAddEditProduct />} />
            <Route path="customers"                 element={<AdminCustomers />} />
            <Route path="customers/:customerId"        element={<CustomerDetail />} />
            <Route path="promotions"                element={<AdminPromotions />} />
            <Route path="reviews"                   element={<AdminReviews />} />
            <Route path="store-locator"             element={<AdminStoreLocator />} />
            <Route path="wholesale"                 element={<AdminWholesale />} />
          </Route>
        </Route>

        {/* /admin → redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Catch-all unknown /admin/* */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
