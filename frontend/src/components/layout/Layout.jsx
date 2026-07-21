import { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import ToastContainer from '@/components/ui/Toast'
import Modal from '@/components/ui/Modal'
import LoginPage from '@/pages/Login'
import useAuthStore from '@/store/authStore'
import useCartStore from '@/store/cartStore'
import useSubscriptionStore from '@/store/subscriptionStore'
import useToastStore from '@/store/toastStore'
import { createSubscription, getSubscriptionPlans } from '@/services/api'
import { MOCK_SUBSCRIPTION } from '@/mock/subscriptions'
import { FloatingCartBar } from '@/components/ui'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}

/**
 * Layout — wraps every route with Header + Footer + Toast
 * Manages the global Login modal state and intercepted cart actions
 */
export default function Layout({ children }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, cartLoginPopupOpen, setCartLoginPopupOpen, pendingAction, setPendingAction } = useAuthStore()
  const { addItem } = useCartStore()
  const { setSubscription } = useSubscriptionStore()
  const { addToast } = useToastStore()
  const [plans, setPlans] = useState([])
  const [showDownload, setShowDownload] = useState(true)

  useEffect(() => {
    if (pendingAction && pendingAction.type === 'SUBSCRIBE' && plans.length === 0) {
      getSubscriptionPlans().then(setPlans).catch(() => {})
    }
  }, [pendingAction, plans])

  useEffect(() => {
    if (user && pendingAction) {
      const executeAction = async () => {
        const action = pendingAction
        setPendingAction(null) // clear immediately to prevent double execution

        if (action.type === 'ADD_TO_CART') {
          addItem(action.payload)
          addToast({ message: `${action.payload.name} added to cart!`, type: 'success' })
        } else if (action.type === 'SUBSCRIBE') {
          const { planId } = action.payload
          try {
            const result = await createSubscription({ planId })
            if (result.success) {
              let planName = 'Your Plan'
              let currentPlans = plans
              if (currentPlans.length === 0) {
                currentPlans = await getSubscriptionPlans()
              }
              const plan = currentPlans.find((p) => p.id === planId)
              if (plan) planName = plan.name

              setSubscription({ ...MOCK_SUBSCRIPTION, planId, planName, status: 'active' })
              addToast({ message: `🎉 Subscribed to ${planName}! Your first box ships soon.`, type: 'success', duration: 5000 })
            }
          } catch (e) {
            addToast({ message: 'Failed to create subscription. Please try again.', type: 'error' })
          }
        }
      }
      executeAction()
    }
  }, [user, pendingAction, addItem, setSubscription, addToast, plans, setPendingAction])

  const { items = [], totalItems = 0 } = useCartStore()
  const location = useLocation()
  const hiddenRoutes = ['/cart', '/checkout', '/admin']
  const isCartBarVisible = user && totalItems > 0 && !hiddenRoutes.some(r => location.pathname.startsWith(r))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* App Download Banner */}
      <AnimatePresence>
        {showDownload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary-container text-on-primary-container overflow-hidden"
          >
            <div className="px-4 py-2.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">smartphone</span>
                <span className="font-semibold text-xs sm:text-sm">Get the NH Salem App for exclusive offers!</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-full shadow-sm">Download</button>
                <button onClick={() => setShowDownload(false)} aria-label="Close banner">
                  <span className="material-symbols-outlined text-on-primary-container text-[18px] block">close</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        onLoginClick={() => setLoginModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className={`flex-1 ${isCartBarVisible ? 'pb-20' : ''}`} id="main-content" tabIndex={-1}>
        <motion.div
          key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />

      <FloatingCartBar hidden={!user || loginModalOpen || cartLoginPopupOpen || mobileMenuOpen} />

      {/* Mobile Sticky Bottom Nav */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-[60] flex items-center justify-around h-[68px] pb-safe">
        <NavLink to="/" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>
        <NavLink to="/category/fish" className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]">grid_view</span>
          <span className="text-[10px] font-semibold">Categories</span>
        </NavLink>
        <NavLink to="/cart" className={({isActive}) => `relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <div className="relative">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-error text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </NavLink>
        <NavLink to="/my-orders" onClick={(e) => {
          if (!user) {
            e.preventDefault()
            setLoginModalOpen(true)
          }
        }} className={({isActive}) => `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]">local_shipping</span>
          <span className="text-[10px] font-semibold">Orders</span>
        </NavLink>
        <button onClick={() => user ? window.location.href='/my-orders' : setLoginModalOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 text-on-surface-variant transition-colors hover:text-primary">
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>

      {/* Global Login Modal */}
      <Modal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title={null}
        id="login-modal"
        size="sm"
        noScroll
      >
        <LoginPage
          isModal
          onSuccess={() => setLoginModalOpen(false)}
        />
      </Modal>

      {/* Cart Login Popup Modal */}
      <Modal
        isOpen={cartLoginPopupOpen}
        onClose={() => setCartLoginPopupOpen(false)}
        title="Sign In Required"
        id="cart-login-popup"
        size="sm"
      >
        <div className="p-6 text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-3xl font-bold">shopping_cart</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-headline-sm text-on-surface font-bold">Please sign in to add items to your cart</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Create an account or sign in to save items to your cart, track deliveries, and subscribe.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setCartLoginPopupOpen(false)
                setLoginModalOpen(true)
              }}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all duration-150 cursor-pointer text-center"
            >
              Sign In
            </button>
            <button
              onClick={() => setCartLoginPopupOpen(false)}
              className="px-6 py-3 rounded-full border border-outline-variant hover:bg-surface-container-low text-on-surface font-semibold text-sm transition-all duration-150 cursor-pointer text-center"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  )
}
