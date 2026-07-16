import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

const FloatingCartBar = ({ hidden }) => {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )
  const navigate = useNavigate()
  const location = useLocation()

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (totalItems > 0) {
      setBump(true)
      const timer = setTimeout(() => setBump(false), 300)
      return () => clearTimeout(timer)
    }
  }, [totalItems])

  const hiddenRoutes = ['/cart', '/checkout', '/admin']
  const shouldHide = hiddenRoutes.some((r) => location.pathname.startsWith(r))

  if (totalItems === 0 || shouldHide || hidden) return null

  return (
    <motion.div
      initial={{ x: 150, opacity: 0, scale: 0.9 }}
      animate={bump ? { x: 0, opacity: 1, scale: [1, 1.08, 1], y: [0, -6, 0] } : { x: 0, opacity: 1, scale: 1, y: 0 }}
      exit={{ x: 150, opacity: 0, scale: 0.9 }}
      transition={bump ? { duration: 0.3, ease: 'easeInOut' } : { type: 'spring', stiffness: 280, damping: 22 }}
      className="fixed bottom-0 left-0 right-0 sm:bottom-5 sm:right-8 sm:left-auto z-[999] w-full sm:w-auto sm:min-w-[290px] max-w-full sm:max-w-sm bg-primary sm:bg-[#0f172a]/95 backdrop-blur-md text-white px-4 py-3 sm:py-2.5 rounded-t-2xl sm:rounded-[14px] shadow-2xl sm:shadow-[0_12px_45px_rgba(0,0,0,0.35)] cursor-pointer border-t sm:border border-white/10 hover:bg-[#131d33] transition-all"
      onClick={() => navigate('/cart')}
    >
      <div className="flex items-center justify-between w-full pb-safe">
        {/* Left side: Cart icon + items count + separator + total */}
        <div className="flex items-center gap-2.5">
          <div className="bg-white/10 text-white p-1.5 rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] font-bold text-white">
              shopping_cart
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-white/90">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
            <span className="text-white/20 text-xs select-none">•</span>
            <span className="font-black text-xs text-amber-400">
              ₹{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right side: View Cart text + Chevron */}
        <div className="flex items-center gap-0.5 font-bold text-[10px] uppercase tracking-wider text-white">
          <span>View Cart</span>
          <span className="material-symbols-outlined text-[14px] font-bold" style={{ display: 'flex', alignItems: 'center' }}>
            chevron_right
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default FloatingCartBar
