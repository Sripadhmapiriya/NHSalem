import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/ui'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import Button from '@/components/ui/Button'

export default function Wishlist() {
  const { user } = useAuthStore()
  const { items, isLoading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user, fetchWishlist])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-outline-variant mb-4" style={{ fontSize: '64px' }}>
          heart_broken
        </span>
        <h2 className="text-title-lg text-on-surface mb-2">Login to View Wishlist</h2>
        <p className="text-on-surface-variant mb-6 max-w-sm">
          Please log in to view and manage your saved items.
        </p>
        <Link to="/login">
          <Button variant="primary">Login Now</Button>
        </Link>
      </div>
    )
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest py-8">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-display-lg-mobile text-on-surface">My Wishlist</h1>
            <p className="text-on-surface-variant mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface-container-low rounded-[24px] p-12 text-center flex flex-col items-center max-w-lg mx-auto mt-12"
            >
              <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                  favorite
                </span>
              </div>
              <h2 className="text-headline-sm text-on-surface mb-3">Your wishlist is empty</h2>
              <p className="text-body-lg text-on-surface-variant mb-8">
                Save your favorite seafood items here to find them quickly later.
              </p>
              <Link to="/shop">
                <Button variant="primary" icon="storefront">
                  Start Shopping
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5"
            >
              <AnimatePresence>
                {items.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
