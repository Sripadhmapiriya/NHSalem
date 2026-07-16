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
      className="fixed bottom-5 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-[999] bg-[#0f172a] text-white px-5 py-3.5 rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,0.3)] cursor-pointer flex items-center justify-between h-14 border border-white/10 hover:bg-[#131d33] transition-colors"
      onClick={() => navigate('/cart')}
    >
      {/* Left side: Cart icon + items count + separator + total */}
      <div className="flex items-center gap-3">
        <div className="bg-white/10 text-white p-1.5 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px] font-bold text-white">
            shopping_cart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs md:text-sm">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span className="text-white/30 text-xs select-none">•</span>
          <span className="font-black text-xs md:text-sm text-amber-400">
            ₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right side: View Cart text + Chevron */}
      <div className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-white">
        <span>View Cart</span>
        <span className="material-symbols-outlined text-[16px] font-bold" style={{ display: 'flex', alignItems: 'center' }}>
          chevron_right
        </span>
      </div>
    </motion.div>
  )
}

export default FloatingCartBar
