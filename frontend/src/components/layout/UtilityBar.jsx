import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

/**
 * UtilityBar — slim Deep Navy bar above the main header
 * Links: Log In / Track Order (left side promos, right side links)
 */
export default function UtilityBar({ onLoginClick }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="bg-primary text-on-primary text-label-sm py-2">
      <div className="container-max flex items-center justify-between gap-4">
        {/* Left — promo */}
        <p className="hidden sm:block text-white/70">
          🐟 Free delivery on orders above ₹499 &nbsp;|&nbsp; Same-day delivery available
        </p>

        {/* Right — links */}
        <div className="flex items-center gap-4 ml-auto">
          {user ? (
            <Link
              to="/orders/NHS-77421"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                location_on
              </span>
              Track Order
            </Link>
          ) : (
            <>
              <button
                onClick={onLoginClick}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                  person
                </span>
                Log In
              </button>
              <span className="text-white/30">|</span>
              <button
                onClick={() => {
                  const orderId = prompt('Enter your Order ID:')
                  if (orderId) navigate(`/orders/${orderId.trim()}`)
                }}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">
                  location_on
                </span>
                Track Order
              </button>
            </>
          )}
          {user && (
            <>
              <span className="text-white/30">|</span>
              <span className="text-secondary-container font-semibold">
                Hi, {user.name?.split(' ')[0] || 'there'} 👋
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
