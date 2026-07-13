import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import { PageSkeleton } from '@/components/ui/Skeleton'
import AdminRoutes from '@/admin/router'

// Lazy-load all customer-facing page components
const Home         = lazy(() => import('@/pages/Home'))
const CategoryListing = lazy(() => import('@/pages/CategoryListing'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Cart         = lazy(() => import('@/pages/Cart'))
const Checkout     = lazy(() => import('@/pages/Checkout'))
const Login        = lazy(() => import('@/pages/Login'))
const About        = lazy(() => import('@/pages/About'))
const Subscriptions = lazy(() => import('@/pages/Subscriptions'))
const OrderTracking = lazy(() => import('@/pages/OrderTracking'))
const Quality      = lazy(() => import('@/pages/Quality'))
const StoreLocator = lazy(() => import('@/pages/StoreLocator'))
const BulkOrders   = lazy(() => import('@/pages/BulkOrders'))
const HelpCenter   = lazy(() => import('@/pages/HelpCenter'))
const NotFound     = lazy(() => import('@/pages/NotFound'))

function PageLoader() {
  return <PageSkeleton />
}

/**
 * RootRoutes — splits traffic at the top level:
 *   /admin/* → AdminRoutes (no customer Layout/Header/Footer)
 *   /*       → customer Layout + all existing routes
 *
 * Both branches live inside the same <BrowserRouter> so they share
 * the same history instance and <Link> components work everywhere.
 */
function RootRoutes() {
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')

  if (isAdminPath) {
    // Admin panel — completely isolated from customer Layout
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-admin-seafoam flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-admin-navy border-t-admin-gold rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    )
  }

  // Customer panel — wrapped in the existing Layout (Header + Footer + Toast + Login modal)
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Core */}
          <Route path="/" element={<Home />} />
          <Route path="/category/:categorySlug" element={<CategoryListing />} />
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Content pages */}
          <Route path="/about" element={<About />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/quality" element={<Quality />} />

          {/* Operational */}
          <Route path="/orders/:orderId" element={<OrderTracking />} />
          <Route path="/stores" element={<StoreLocator />} />
          <Route path="/bulk-orders" element={<BulkOrders />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RootRoutes />
    </BrowserRouter>
  )
}
