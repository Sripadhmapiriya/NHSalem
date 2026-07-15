import { useState, useEffect, useRef, memo } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchInput, IconButton, Modal, Input, Button } from '@/components/ui'
import useCartStore from '@/store/cartStore'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import useDebounce from '@/hooks/useDebounce'
import { getProducts } from '@/services/api'

const NAV_LINKS = [
  { label: 'Fish', slug: 'fish', emoji: '🐟' },
  { label: 'Prawns', slug: 'prawns-shrimp', emoji: '🍤' },
  { label: 'Crabs', slug: 'crabs', emoji: '🦀' },
  { label: 'Lobster', slug: 'lobster', emoji: '🦞' },
  { label: 'Dried Fish', slug: 'dried-fish', emoji: '🧂' },
  { label: 'Combos', slug: 'combos', emoji: '🍱' },
]

/**
 * Header — white main header with logo left, nav center, icons right
 * Gains glassmorphism blur on scroll past hero
 */
function Header({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  const totalItems = useCartStore((state) => state.totalItems)
  const wishlistCount = useWishlistStore((state) => state.count)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const debouncedSearch = useDebounce(searchQuery, 300)

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

  // Scroll glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header
      className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-outline-variant/20 transition-shadow duration-300 will-change-transform transform-gpu [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
    >
      {/* Top Deck Accent Bar (Hidden on Mobile) */}
      {!scrolled && (
        <div className="bg-primary text-white text-[11px] font-semibold py-1 px-4 hidden md:block border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-1.5 opacity-90">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span>Delivering Fresh across Salem, Tamil Nadu</span>
            </div>
            <div className="animate-pulse text-amber-300">
              ✨ Use code <span className="font-bold">FRESH100</span> for free delivery on orders above ₹499!
            </div>
            <div className="flex items-center gap-4 opacity-90">
              <Link to="/about" className="hover:text-amber-200 transition-colors">Our Story</Link>
              <span>|</span>
              <Link to="/stores" className="hover:text-amber-200 transition-colors">Stores</Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4 h-14 md:h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 flex-shrink-0 select-none hover:opacity-95 transition-opacity"
          aria-label="NH Salem Sea Foods — Home"
        >
          <img
            src="/crest.png"
            alt="NH Salem Sea Foods Logo"
            className="w-9 h-9 object-contain"
            loading="eager"
            fetchpriority="high"
            width={36}
            height={36}
          />
          <div className="hidden sm:block text-left pl-3 border-l border-outline-variant/30">
            <p className="font-serif text-headline-sm font-black text-primary leading-tight tracking-tight">NH Salem</p>
            <p className="text-[10px] font-bold text-on-surface-variant tracking-[0.25em] uppercase leading-none mt-0.5">Sea Foods</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-1 px-2 py-1 bg-surface-container-low/60 border border-outline-variant/40 rounded-full shadow-inner-sm"
          aria-label="Product categories"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.slug}
              to={`/category/${link.slug}`}
              className={({ isActive }) =>
                `px-3 py-1 rounded-full text-sm font-bold transition-all duration-250 flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-blue-700 text-white shadow-sm shadow-primary/25 scale-[1.02]'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`
              }
            >
              <span className="text-[14px] leading-none flex-shrink-0">{link.emoji}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/subscriptions"
            className={({ isActive }) =>
              `px-3 py-1 rounded-full text-sm font-bold transition-all duration-250 ml-1 flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm shadow-amber-600/25 scale-[1.02]'
                  : 'text-secondary hover:bg-secondary-container/20'
              }`
            }
          >
            <span className="text-[14px] leading-none flex-shrink-0">✦</span>
            <span>Subscribe</span>
          </NavLink>
        </nav>

        {/* Right icons / control deck */}
        <div className="flex items-center gap-2.5 ml-auto md:ml-0">
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-surface-container-low/70 border border-outline-variant/30 rounded-full shadow-inner-sm">
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
                      className="w-44 sm:w-60 text-[13px]"
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
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container hover:border-primary/40 transition-all cursor-pointer select-none focus:outline-none"
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
            <span className="text-xs font-bold text-on-surface-variant">Track Order</span>
          </button>

          {/* AuthControl */}
          {user ? (
            <button
              onClick={() => setLogoutConfirmOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-outline-variant/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer select-none focus:outline-none animate-fade-in whitespace-nowrap flex-shrink-0"
              aria-label={`Logged in as ${user.name}. Click to log out.`}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold uppercase">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="text-label-sm font-bold text-primary truncate max-w-[90px]">
                {user.name?.split(' ')[0] || 'User'}
              </span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/30 bg-primary hover:bg-primary/95 text-white shadow-sm hover:shadow transition-all cursor-pointer select-none focus:outline-none text-sm font-bold whitespace-nowrap flex-shrink-0"
              aria-label="Account login"
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white/20">
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
            className="md:hidden"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 md:hidden border-t border-b border-outline-variant/30 bg-white z-40 shadow-lg overflow-hidden"
          >
            <nav className="container-max py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.slug}
                  to={`/category/${link.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-[12px] text-body-md font-semibold transition-colors flex items-center gap-2 ${
                      isActive ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container'
                    }`
                  }
                >
                  <span className="text-[16px]">{link.emoji}</span>
                  <span>{link.label}</span>
                </NavLink>
              ))}
              <NavLink
                to="/subscriptions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-[12px] text-body-md font-semibold text-secondary hover:bg-secondary-container/20 transition-colors"
              >
                ✦ Subscribe
              </NavLink>
              <div className="border-t border-outline-variant/30 mt-2 pt-4 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setTrackModalOpen(true)
                  }}
                  className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-2.5 text-left w-full cursor-pointer select-none"
                >
                  <span className="material-symbols-outlined text-primary font-bold" style={{ fontSize: '18px' }}>
                    radar
                  </span>
                  Track Order
                </button>
                <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">About Us</NavLink>
                <NavLink to="/quality" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Quality Promise</NavLink>
                <NavLink to="/stores" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Store Locator</NavLink>
                <NavLink to="/bulk-orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">B2B / Bulk</NavLink>
                <NavLink to="/help" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-[12px] text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Help Center</NavLink>
              </div>
              {user ? (
                <div className="flex flex-col gap-2 mx-4 mt-2">
                  <div className="text-center py-2 text-label-md font-semibold text-primary bg-primary/5 rounded-[12px] border border-outline-variant/30">
                    Hi, {user.name} 👋
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setLogoutConfirmOpen(true) }}
                    className="py-3 bg-surface-container-highest border border-outline-variant/50 text-on-surface rounded-full text-label-md font-semibold flex items-center justify-center gap-2"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setMobileMenuOpen(false); onLoginClick?.() }}
                  className="mx-4 mt-2 py-3 bg-primary text-on-primary rounded-full text-label-md font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">person</span>
                  Log In / Sign Up
                </button>
              )}
            </nav>
          </motion.div>
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
          <Input
            id="track-order-id-input"
            label="Order ID"
            placeholder="e.g. NHS-39102"
            value={orderIdInput}
            onChange={(e) => {
              setOrderIdInput(e.target.value)
              if (trackError) setTrackError('')
            }}
            error={trackError}
            required
            autoFocus
          />
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
    </header>
  )
}

export default memo(Header)
