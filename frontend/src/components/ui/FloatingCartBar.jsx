import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

const FloatingCartBar = () => {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )
  const navigate = useNavigate()
  const location = useLocation()

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const hiddenRoutes = ['/cart', '/checkout', '/admin']
  const shouldHide = hiddenRoutes.some((r) => location.pathname.startsWith(r))

  if (totalItems === 0 || shouldHide) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="fixed bottom-0 left-0 right-0 z-[999] bg-[#0f172a] text-white px-5 py-4 rounded-t-[20px] shadow-[0_-8px_30px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-between h-16 max-w-5xl mx-auto border-t border-white/5 backdrop-blur-md"
      onClick={() => navigate('/cart')}
    >
      {/* Left side: Cart icon + items count + separator + total */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 text-primary-container p-2 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px] font-bold text-white">
            shopping_cart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span className="text-white/40 text-xs">•</span>
          <span className="font-extrabold text-sm sm:text-base text-primary-container">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right side: View Cart text + Chevron */}
      <div className="flex items-center gap-1 font-bold text-sm sm:text-base text-white/90 hover:text-white transition-colors">
        <span>View Cart</span>
        <span className="material-symbols-outlined text-[18px] font-bold" style={{ display: 'flex', alignItems: 'center' }}>
          chevron_right
        </span>
      </div>
    </motion.div>
  )
}

export default FloatingCartBar
