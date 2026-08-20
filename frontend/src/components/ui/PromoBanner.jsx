import { useState, useEffect } from 'react'
import { getPublicPromoSettings } from '@/services/api'
import useToastStore from '@/store/toastStore'

export default function PromoBanner() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()

  useEffect(() => {
    getPublicPromoSettings()
      .then((res) => {
        if (res.success && res.banner?.enabled && res.banner?.coupons && res.banner.coupons.length > 0) {
          setCoupons(res.banner.coupons)
        }
      })
      .catch((err) => console.error('Failed to load promo banner', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || coupons.length === 0) return null

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    addToast({ message: `Coupon code ${code} copied!`, type: 'success' })
  }

  return (
    <div className="bg-gradient-to-r from-[#000516] to-[#0b1e3d] text-white py-3 px-4 relative overflow-hidden shadow-md">
      {/* Decorative subtle pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      <div className="container-max mx-auto relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {coupons.map((coupon, index) => (
          <div key={coupon.id} className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fed255] animate-pulse">local_offer</span>
              <span className="text-sm md:text-base font-bold tracking-wide">
                {coupon.description || 'Special Offer Available!'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full py-1 px-1 pl-4 border border-white/20">
              <span className="text-xs text-white/80 uppercase tracking-wider font-semibold">Use Code:</span>
              <code className="text-[#fed255] font-black text-sm md:text-base tracking-widest">{coupon.code}</code>
              <button
                onClick={() => handleCopy(coupon.code)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-[#fed255] hover:text-[#000516] flex items-center justify-center transition-colors ml-1 cursor-pointer"
                title="Copy Code"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
              </button>
            </div>

            {/* Divider dot between coupons on desktop */}
            {index < coupons.length - 1 && (
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30 ml-3"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
