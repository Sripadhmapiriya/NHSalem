import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAdminAuthStore from '@/store/adminAuthStore'

const NAV_ITEMS = [
  { to: '/admin/dashboard',      icon: 'space_dashboard',   label: 'Dashboard' },
  { to: '/admin/orders',         icon: 'receipt_long',      label: 'Orders' },
  { to: '/admin/products',       icon: 'inventory_2',       label: 'Products' },
  { to: '/admin/customers',      icon: 'group',             label: 'Customers' },
  { to: '/admin/promotions',     icon: 'local_offer',       label: 'Promotions' },
  { to: '/admin/reviews',        icon: 'star_rate',         label: 'Reviews' },
  { to: '/admin/store-locator',  icon: 'store',             label: 'Store Locator' },
  { to: '/admin/wholesale',      icon: 'business_center',   label: 'Wholesale / B2B' },
]

const PAGE_TITLES = {
  '/admin/dashboard':     'Dashboard',
  '/admin/orders':        'Orders',
  '/admin/products':      'Products',
  '/admin/customers':     'Customers',
  '/admin/promotions':    'Promotions',
  '/admin/reviews':       'Reviews',
  '/admin/store-locator': 'Store Locator & Delivery Zones',
  '/admin/wholesale':     'Wholesale / B2B Inquiries',
}

/**
 * AdminLayout — persistent shell for all protected admin pages.
 * Fixed 260px Deep-Navy sidebar + 64px white topbar.
 * Main content area scrolls independently.
 */
export default function AdminLayout() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPath = window.location.pathname
  // Find the deepest matching page title
  const pageTitle = Object.entries(PAGE_TITLES)
    .filter(([key]) => currentPath.startsWith(key))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'Admin'

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const sidebarHtml = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/crest.png" alt="NH Salem Sea Foods Logo" className="w-12 h-12 object-contain" />
          <div className="min-w-0 pl-3 border-l border-white/10">
            <p className="font-serif text-white font-extrabold text-[15px] leading-tight tracking-tight">NH Salem</p>
            <p className="text-white/45 text-[9px] font-bold tracking-[0.18em] uppercase">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-150 group select-none ${
                isActive
                  ? 'bg-white/10 text-white border-l-[3px] border-admin-gold pl-[9px]'
                  : 'text-white/55 border-l-[3px] border-transparent hover:text-white/90 hover:bg-white/6'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined flex-shrink-0 leading-none"
                  style={{ fontSize: '18px', fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin user + logout */}
      <div className="flex-shrink-0 border-t border-white/8 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-[10px] bg-white/5 mb-1">
          <div className="w-7 h-7 rounded-full bg-admin-gold/20 border border-admin-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="text-admin-gold font-bold text-[11px] uppercase">
              {admin?.name?.charAt(0) ?? 'A'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[12px] font-semibold truncate leading-tight">{admin?.name ?? 'Admin'}</p>
            <p className="text-white/40 text-[10px] truncate leading-tight">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-white/50 hover:text-white hover:bg-white/8 transition-colors duration-150 text-[12px] font-semibold"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
          Log Out
        </button>
      </div>
    </div>
  )

  const mainRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-admin-seafoam">

      {/* ── Desktop Sidebar (fixed, 260px) ─────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-[260px] flex-shrink-0 h-screen overflow-hidden"
        style={{ background: '#0B1E3D' }}
        aria-label="Admin sidebar"
      >
        {sidebarHtml}
      </aside>

      {/* ── Mobile Sidebar (off-canvas drawer) ─────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 w-[260px] z-50 md:hidden flex flex-col overflow-hidden"
              style={{ background: '#0B1E3D' }}
            >
              {sidebarHtml}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Right column: topbar + scrollable content ──────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

        {/* Topbar (fixed height 64px) */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-admin-border/60 flex items-center justify-between px-4 md:px-6 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden w-10 h-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-admin-seafoam transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <span className="material-symbols-outlined text-admin-navy" style={{ fontSize: '22px' }}>menu</span>
            </button>
            <h1 className="text-[15px] font-bold text-admin-navy tracking-tight">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell (decorative — wired in later task) */}
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-admin-seafoam transition-colors relative" aria-label="Notifications">
              <span className="material-symbols-outlined text-admin-text-sub" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-admin-coral border border-white" />
            </button>
            {/* Admin avatar */}
            <div className="w-8 h-8 rounded-full bg-admin-navy flex items-center justify-center border-2 border-admin-gold/30 cursor-default select-none" title={admin?.email}>
              <span className="text-white font-bold text-[11px]">{admin?.name?.charAt(0) ?? 'A'}</span>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
