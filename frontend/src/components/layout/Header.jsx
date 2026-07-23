import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchInput, IconButton, Modal, Input, Button } from '@/components/ui'
import { useCartStore } from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import useDebounce from '@/hooks/useDebounce'
import { getProducts } from '@/services/api'

const NAV_LINKS = [
  { label: 'Home', sectionId: 'hero', path: '/' },
  { label: 'Products', path: '/category' },
  { label: 'About', sectionId: 'about', path: '/#about' },
  { label: 'Contact', sectionId: 'contact', path: '/#contact' },
]

/**
 * Header — white main header with logo left, nav center, icons right
 * Gains glassmorphism blur on scroll past hero
 */
function Header({ onLoginClick, mobileMenuOpen, setMobileMenuOpen }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const searchRef = useRef(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  const rawTotalItems = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const wishlistCount = useWishlistStore((state) => state.count)
  const user = useAuthStore((state) => state.user)
  const totalItems = user ? rawTotalItems : 0
  const logout = useAuthStore((state) => state.logout)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Profile dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)

  const handleNavClick = (e, link) => {
    if (link.sectionId) {
      e.preventDefault()
      if (window.location.pathname === '/') {
        if (link.sectionId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          const el = document.getElementById(link.sectionId)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      } else {
        navigate('/')
        setTimeout(() => {
          if (link.sectionId === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            const el = document.getElementById(link.sectionId)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }, 150)
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Track Order Modal state
  const [trackModalOpen, setTrackModalOpen] = useState(false)
  const [orderIdInput, setOrderIdInput] = useState('')
  const [trackError, setTrackError] = useState('')

  const handleTrackSubmit = (e) => {
    e.preventDefault()
    if (!orderIdInput.trim()) {
      setTrackError('Please enter an Order ID')
      return
    }
    if (orderIdInput.trim().length < 4) {
      setTrackError('Order ID must be at least 4 characters long')
      return
    }
    setTrackError('')
    setTrackModalOpen(false)
    navigate(`/orders/${orderIdInput.trim()}`)
    setOrderIdInput('')
  }


  // Live search
  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults([]); return }
    getProducts({ search: debouncedSearch }).then((data) =>
      setSearchResults(data.slice(0, 6))
    )
  }, [debouncedSearch])

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen])

  return (
    <>


      <header
        className="sticky top-0 z-50 w-full bg-white shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-b border-outline-variant/15 will-change-transform transform-gpu"
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >

      <div className="container-max flex items-center justify-between gap-2 xl:gap-6 h-14 md:h-16">
        {/* Logo */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, { sectionId: 'hero' })}
          className="flex items-center gap-3 flex-shrink-0 select-none hover:opacity-95 transition-opacity"
          aria-label="NH Salem Sea Foods — Home"
        >
          <img
            src="/crest.png"
            alt="NH Salem Sea Foods Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
            loading="eager"
            fetchpriority="high"
            width={56}
            height={56}
          />
          <div className="hidden sm:block text-left pl-3 border-l border-outline-variant/30">
            <p className="font-serif text-headline-sm font-black text-primary leading-tight tracking-tight">NH Salem</p>
            <p className="text-[10px] font-bold text-on-surface-variant tracking-[0.25em] uppercase leading-none mt-0.5">Sea Foods</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden lg:flex items-center gap-6 px-4 py-1.5"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              onClick={(e) => handleNavClick(e, link)}
              end={link.path === '/'}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-all duration-200 relative py-1 flex items-center ${
                  isActive && !link.sectionId
                    ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full'
                    : 'text-on-surface-variant hover:text-primary hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-[2px] hover:after:bg-primary/40 hover:after:rounded-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right icons / control deck */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <div className="h-9 flex items-center gap-1 px-2 bg-surface-container-low/70 border border-outline-variant/30 rounded-full shadow-inner-sm">
            {/* Search */}
            <div ref={searchRef} className="relative">
              {searchOpen ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchInput
                      id="header-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search seafood…"
                      className="w-44 sm:w-60 text-[13px] py-1 h-7"
                    />
                    {/* Dropdown results */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[16px] shadow-stat border border-outline-variant/30 overflow-hidden z-50"
                        >
                          {searchResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                navigate(`/product/${p.id}`)
                                setSearchOpen(false)
                                setSearchQuery('')
                                setSearchResults([])
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                            >
                              <img
                                src={p.image}
                                alt=""
                                className="w-10 h-10 rounded-[8px] object-cover flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-label-md text-on-surface font-semibold truncate">{p.name}</p>
                                <p className="text-label-sm text-on-surface-variant">
                                  ₹{p.basePrice?.toLocaleString()}
                                </p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <IconButton
                    size="sm"
                    icon="close"
                    aria-label="Close search"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }}
                  />
                </div>
              ) : (
                <IconButton
                  size="sm"
                  icon="search"
                  aria-label="Open search"
                  onClick={() => setSearchOpen(true)}
                />
              )}
            </div>

            {/* Wishlist */}
            <Link to="/cart" aria-label={`Wishlist, ${wishlistCount} items`}>
              <IconButton
                size="sm"
                icon="favorite"
                aria-label={`Wishlist (${wishlistCount} items)`}
                badge={wishlistCount}
                as="div"
              />
            </Link>

            {/* Cart */}
            <Link to="/cart" aria-label={`Shopping cart, ${totalItems} items`}>
              <motion.div
                animate={totalItems > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <IconButton
                  size="sm"
                  icon="shopping_cart"
                  aria-label={`Cart (${totalItems} items)`}
                  badge={totalItems}
                  as="div"
                />
              </motion.div>
            </Link>
          </div>

          {/* Track Order */}
          <button
            onClick={() => setTrackModalOpen(true)}
            className="hidden xl:flex h-9 items-center gap-1.5 px-3.5 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container hover:border-primary/40 transition-all cursor-pointer select-none focus:outline-none whitespace-nowrap flex-shrink-0 text-xs font-bold text-on-surface-variant"
            aria-label="Track your order live"
          >
            <motion.span
              animate={{ scale: [1, 1.18, 1], opacity: [0.75, 1, 0.75] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="material-symbols-outlined text-primary font-bold"
              style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}
            >
              radar
            </motion.span>
            <span className="whitespace-nowrap">Track Order</span>
          </button>

          {/* AuthControl */}
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hidden md:flex h-9 items-center gap-2 px-3.5 rounded-full border border-outline-variant/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer select-none focus:outline-none animate-fade-in whitespace-nowrap flex-shrink-0 text-xs font-bold text-primary"
                aria-label={`Logged in as ${user.name}. Click to view menu.`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold uppercase">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span className="truncate max-w-[90px]">
                  {user.name?.split(' ')[0] || 'User'}
                </span>
                <span className="material-symbols-outlined text-primary font-bold text-xs">
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-stat border border-outline-variant/30 py-1 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/40">
                      <p className="font-semibold text-xs text-on-surface truncate">{user.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm font-bold text-on-surface-variant">
                        local_shipping
                      </span>
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        setLogoutConfirmOpen(true)
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-error hover:bg-error/5 w-full text-left transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm font-bold text-error">
                        logout
                      </span>
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden md:flex h-9 items-center gap-2 px-4 rounded-full border border-outline-variant/30 bg-primary hover:bg-primary/95 text-white shadow-sm hover:shadow transition-all cursor-pointer select-none focus:outline-none text-xs font-bold whitespace-nowrap flex-shrink-0"
              aria-label="Account login"
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white/20 flex-shrink-0">
                <span className="material-symbols-outlined text-white font-bold" style={{ fontSize: '10px' }}>
                  person
                </span>
              </div>
              <span className="whitespace-nowrap">Log In</span>
            </button>
          )}

          {/* Mobile menu */}
          <IconButton
            size="sm"
            icon={mobileMenuOpen ? 'close' : 'menu'}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden"
          />
        </div>
      </div>
    </header>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#000516]/40 backdrop-blur-sm z-50 xl:hidden"
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-[290px] bg-white z-50 xl:hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-outline-variant/30 flex-shrink-0">
                <span className="font-serif font-black text-primary text-headline-sm">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
                </button>
              </div>

              {/* Navigation Content */}
              <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.label}
                    to={link.path}
                    end={link.path === '/'}
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      handleNavClick(e, link)
                    }}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-[12px] text-body-md font-semibold transition-colors flex items-center justify-between min-h-[44px] ${
                        isActive && !link.sectionId ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <span className="material-symbols-outlined text-[18px] opacity-60">chevron_right</span>
                  </NavLink>
                ))}
                
                <div className="border-t border-outline-variant/30 mt-2 pt-4 flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setTrackModalOpen(true)
                    }}
                    className="px-4 py-3 rounded-[12px] text-body-md font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-between text-left w-full cursor-pointer select-none min-h-[44px]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary font-bold" style={{ fontSize: '18px' }}>
                        radar
                      </span>
                      Track Order
                    </span>
                    <span className="material-symbols-outlined text-[18px] opacity-60">chevron_right</span>
                  </button>

                  <NavLink to="/quality" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Quality Promise</NavLink>
                  <NavLink to="/stores" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Store Locator</NavLink>
                  <NavLink to="/bulk-orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors min-h-[44px] flex items-center">B2B / Bulk</NavLink>
                </div>

                {/* Login option kept inside the sidebar */}
                <div className="mt-auto border-t border-outline-variant/20 pt-4 flex-shrink-0">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-center py-2 text-label-md font-semibold text-primary bg-primary/5 rounded-[12px] border border-outline-variant/30">
                        Hi, {user.name} 👋
                      </div>
                      <NavLink
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-3 bg-white border border-outline-variant/50 text-on-surface rounded-full text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                        My Orders
                      </NavLink>
                      <button
                        onClick={() => { setMobileMenuOpen(false); setLogoutConfirmOpen(true) }}
                        className="py-3 bg-surface-container-highest border border-outline-variant/50 text-on-surface rounded-full text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); onLoginClick?.() }}
                      className="w-full py-3 bg-primary text-on-primary rounded-full text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">person</span>
                      Log In / Sign Up
                    </button>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Track Order Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => {
          setTrackModalOpen(false)
          setOrderIdInput('')
          setTrackError('')
        }}
        title="Track Your Order"
        id="track-order-modal"
        size="sm"
      >
        <form onSubmit={handleTrackSubmit} className="space-y-4 pt-1">
          <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
            Enter your Order ID (e.g., <span className="font-mono text-primary font-bold">NHS-39102</span>) to view its live status and fresh catch details.
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="track-order-id-input" className="text-label-md text-on-surface-variant font-semibold">
              Order ID <span className="text-error ml-1">*</span>
            </label>
            <input
              id="track-order-id-input"
              type="text"
              value={orderIdInput}
              onChange={(e) => {
                setOrderIdInput(e.target.value)
                if (trackError) setTrackError('')
              }}
              placeholder="e.g. NHS-39102"
              className="w-full px-4 py-3 border border-outline-variant rounded-full outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary text-sm bg-surface-container-low text-on-surface"
              autoFocus
              autoComplete="off"
              required
            />
            {trackError && (
              <p className="text-label-sm text-error flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">error</span>
                {trackError}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setTrackModalOpen(false)
                setOrderIdInput('')
                setTrackError('')
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Track Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Confirm Log Out"
        id="logout-confirm-modal"
        size="sm"
      >
        <div className="p-5 text-center space-y-4">
          <p className="text-body-md text-on-surface-variant">
            Are you sure you want to log out of your account?
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setLogoutConfirmOpen(false)}
              className="px-5 py-2.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setLogoutConfirmOpen(false)
                logout()
                navigate('/')
              }}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-colors focus:outline-none cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default React.memo(Header)
