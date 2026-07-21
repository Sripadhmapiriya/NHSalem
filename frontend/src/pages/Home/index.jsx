import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { getProducts, subscribeNewsletter } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useInView, { useCountUp } from '@/hooks/useInView'

// Hero slides
const HERO_SLIDES = [
  {
    id: 1,
    headline: 'Fresh Catch at Your Fingertips',
    sub: 'From coast to kitchen in under 24 hours. No compromise on freshness.',
    cta: 'Shop Today\'s Catch',
    ctaTo: '/category/fish',
    badge: 'Freshness Guaranteed',
    bg: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1400&q=85',
  },
  {
    id: 2,
    headline: 'Premium Tiger Prawns',
    sub: 'Gulf of Mannar sourced. Jumbo grade. Delivered in 3 hours.',
    cta: 'Order Prawns',
    ctaTo: '/category/prawns-shrimp',
    badge: 'HOT DEAL — 20% Off',
    bg: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1400&q=85',
  },
  {
    id: 3,
    headline: 'Subscribe & Save 20%',
    sub: 'Curated sea-to-table boxes delivered on your schedule. Cancel anytime.',
    cta: 'Explore Plans',
    ctaTo: '/subscriptions',
    badge: 'New — Subscription Plans',
    bg: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=1400&q=85',
  },
]

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const TESTIMONIALS = [
  { id: 1, name: 'Priya M.', rating: 5, text: 'Absolutely the freshest prawns I have ever bought in Salem. Packaging was top notch!', image: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Senthil K.', rating: 5, text: 'The Vanjaram slices were perfect. Cleaned very well and delivered exactly on time.', image: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Anitha R.', rating: 5, text: 'I love the Weekend BBQ platter! The lobster tails were a huge hit with my family.', image: 'https://i.pravatar.cc/150?u=3' },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Active order banner state
  const [activeOrder, setActiveOrder] = useState(null)
  
  useEffect(() => {
    if (user) {
      // Auto-detect logged-in user's active order
      setActiveOrder({ id: 'NHS-77421', status: 'Out for Delivery' })
    } else {
      setActiveOrder(null)
    }
  }, [user])

  // Stats band
  const [statsRef, statsInView] = useInView({ once: true })
  const cities = useCountUp(8, 1800, statsInView)
  const orders = useCountUp(50000, 2000, statsInView)
  const partners = useCountUp(120, 1600, statsInView)

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentSlide])

  // Fetch best sellers
  useEffect(() => {
    getProducts().then((data) => {
      setBestSellers(data.filter((p) => p.isBestSeller).slice(0, 4))
      setLoading(false)
    })
  }, [])

  // Newsletter form
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(newsletterSchema),
  })

  const onNewsletterSubmit = async ({ email }) => {
    try {
      await subscribeNewsletter(email)
      addToast({ message: `🎉 Subscribed! Check your email for a welcome message.`, type: 'success' })
      reset()
    } catch (err) {
      if (err.message === 'You are already subscribed!') {
        addToast({ message: 'You are already subscribed!', type: 'info' })
      } else {
        addToast({ message: err.message || 'Subscription failed. Please try again.', type: 'error' })
      }
    }
  }

  return (
    <div>
      {/* ── Hero Carousel ──────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden">
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, i) =>
            i === currentSlide ? (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 cursor-pointer group"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              >
                <img src={slide.bg} alt={slide.headline} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                <div className="absolute inset-0 bg-hero-gradient" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container-max w-full">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-xl">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="premium">{slide.badge}</Badge>
                        <Badge variant="glass" className="bg-[#0b1e3d]/40 backdrop-blur-md border border-white/20 text-white">
                          <span className="material-symbols-outlined text-[#4ADE80] text-[13px] mr-1">local_shipping</span> Free Delivery Above ₹499
                        </Badge>
                      </div>
                      <h1 className="text-display-lg-mobile md:text-display-lg text-white mb-4 leading-tight">{slide.headline}</h1>
                      <p className="text-body-lg text-white/80 mb-8 max-w-md">{slide.sub}</p>
                      <Button variant="primary" size="lg" onClick={(e) => { e.stopPropagation(); navigate(slide.ctaTo) }}>{slide.cta}</Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i) }} className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${i === currentSlide ? 'bg-white shadow-sm' : 'bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      </section>

      {/* ── Search Bar directly below hero ─────────────────────────────── */}
      <section className="bg-background -mt-6 relative z-30 px-4">
        <div className="container-max max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-2 border border-outline-variant/30 flex items-center gap-2">
          <SearchInput
            id="hero-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fish, prawns, crabs..."
            className="flex-1 border-none shadow-none text-base bg-transparent px-4"
          />
          <Button variant="primary" onClick={() => navigate(`/category/fish?search=${searchQuery}`)}>Search</Button>
        </div>
      </section>

      {/* ── Active Order Persistent Banner ─────────────────────────────── */}
      {activeOrder && (
        <section className="px-4 mt-6 z-20 relative">
          <div className="container-max max-w-3xl mx-auto">
            <div 
              className="bg-gradient-to-r from-[#0b1e3d] to-primary text-white rounded-xl p-4 flex items-center justify-between shadow-stat cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(`/track-order`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>package_2</span>
                </div>
                <div>
                  <p className="font-bold text-headline-sm leading-tight text-white">Track Your Active Order</p>
                  <p className="text-sm text-white/80 mt-0.5">Order #{activeOrder.id} is currently <span className="font-bold text-[#86efac]">{activeOrder.status}</span></p>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/80 hidden sm:block">arrow_forward_ios</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust / Process Strip ──────────────────────────────────────── */}
      <section className="bg-background pt-16 pb-8" aria-label="Our Process">
        <div className="container-max max-w-5xl mx-auto text-center">
          <h2 className="text-headline-sm text-primary font-bold mb-10">Our Freshness Guarantee</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative">
            
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-outline-variant/30 z-0"></div>

            <div className="flex flex-col items-center gap-3 z-10 bg-background px-4">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm"><span className="material-symbols-outlined text-3xl">sailing</span></div>
              <div>
                <p className="font-bold text-on-surface text-label-md">1. Caught Fresh</p>
                <p className="text-xs text-on-surface-variant max-w-[150px] mt-1">Sourced directly from daily coastal auctions</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 z-10 bg-background px-4 mt-4 md:mt-0">
              <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-600 shadow-sm"><span className="material-symbols-outlined text-3xl">ac_unit</span></div>
              <div>
                <p className="font-bold text-on-surface text-label-md">2. Flash Iced</p>
                <p className="text-xs text-on-surface-variant max-w-[150px] mt-1">0-4°C cold chain maintained instantly</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-3 z-10 bg-background px-4 mt-4 md:mt-0">
              <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-green-600 shadow-sm"><span className="material-symbols-outlined text-3xl">local_shipping</span></div>
              <div>
                <p className="font-bold text-on-surface text-label-md">3. Delivered</p>
                <p className="text-xs text-on-surface-variant max-w-[150px] mt-1">To your doorstep in under 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Today's Best Sellers ───────────────────────────────────────── */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="best-sellers-heading">
        <div className="container-max">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">✦ Today's Catch</p>
              <h2 id="best-sellers-heading" className="text-display-lg-mobile text-on-surface">Today's Best Sellers</h2>
            </div>
            <Link to="/category/fish" className="hidden sm:flex items-center gap-1.5 text-label-md text-primary font-semibold hover:underline">
              View all <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) : bestSellers.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="secondary" onClick={() => navigate('/category/fish')}>View All Products</Button>
          </div>
        </div>
      </section>

      {/* ── Promo Banners ──────────────────────────────────────────────── */}
      <section className="py-12 bg-background" aria-label="Promotions">
        <div className="container-max grid md:grid-cols-2 gap-6">
          <PromoBanner
            tag="WEEKEND SPECIAL"
            headline="Weekend BBQ Platter at 30% Off"
            sub="Jumbo Tiger Prawns + Silver Pomfret + Spiny Lobster Tails"
            cta="Grab the Deal"
            to="/category/combos"
            bg="from-[#0b1e3d] to-primary"
            accent="text-[#86efac]"
            showCountdown={true}
          />
          <PromoBanner
            tag="FIRST ORDER"
            headline="First Order? Get ₹200 Cashback"
            sub="Use code WELCOME200 at checkout. Valid on orders above ₹499."
            cta="Shop Now"
            to="/category/fish?promo=WELCOME200"
            bg="from-amber-600 to-primary"
            accent="text-[#fef3c7]"
          />
        </div>
      </section>
      
      {/* ── Customer Testimonials ──────────────────────────────────────── */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="testimonials-heading">
        <div className="container-max">
          <div className="text-center mb-10">
            <h2 id="testimonials-heading" className="text-display-lg-mobile text-on-surface">What Our Customers Say</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">Join thousands of happy seafood lovers in Salem.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[#f59e0b] filled text-[20px]">star</span>
                  ))}
                </div>
                <p className="text-body-md text-on-surface flex-1 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
                  <img src={review.image} alt={review.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" />
                  <p className="text-label-md font-bold text-on-surface">{review.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ──────────────────────────────────────────────── */}
      <section className="py-16 bg-background" aria-labelledby="categories-heading">
        <div className="container-max">
          <div className="text-center mb-10">
            <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">Our Range</p>
            <h2 id="categories-heading" className="text-display-lg-mobile text-on-surface">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Fish', slug: 'fish', icon: 'set_meal', color: 'bg-blue-50' },
              { label: 'Prawns', slug: 'prawns-shrimp', icon: 'restaurant', color: 'bg-orange-50' },
              { label: 'Crabs', slug: 'crabs', icon: 'emoji_food_beverage', color: 'bg-red-50' },
              { label: 'Lobster', slug: 'lobster', icon: 'local_dining', color: 'bg-amber-50' },
              { label: 'Dried Fish', slug: 'dried-fish', icon: 'grain', color: 'bg-yellow-50' },
              { label: 'Combos', slug: 'combos', icon: 'inventory_2', color: 'bg-emerald-50' },
            ].map((cat, i) => (
              <motion.div key={cat.slug} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                <Link to={`/category/${cat.slug}`} className={`flex flex-col items-center gap-3 p-5 ${cat.color} rounded-[20px] hover:shadow-card transition-all duration-200 hover:-translate-y-1 group`}>
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-card transition-shadow">
                    <span className="material-symbols-outlined text-primary text-[28px]">{cat.icon}</span>
                  </div>
                  <span className="text-label-md font-semibold text-on-surface">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="newsletter-heading">
        <div className="container-max max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-4 block">mail</span>
          <h2 id="newsletter-heading" className="text-display-lg-mobile text-on-surface mb-3">Stay in the Loop</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">Get early access to flash sales, new arrivals, and seasonal catches straight to your inbox.</p>
          <form onSubmit={handleSubmit(onNewsletterSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
            <div className="flex-1">
              <input type="email" placeholder="your@email.com" {...register('email')} className="w-full rounded-full bg-white border border-outline-variant px-5 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none" />
              {errors.email && <p className="text-label-sm text-error mt-1.5 text-left pl-2">{errors.email.message}</p>}
            </div>
            <Button type="submit" variant="primary" loading={isSubmitting}>Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 14, m: 23, s: 45 })
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev
        if (s > 0) s--
        else {
          s = 59
          if (m > 0) m--
          else {
            m = 59
            if (h > 0) h--
          }
        }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div className="flex items-center gap-2 mb-6 mt-2">
      <span className="text-white/80 text-sm font-semibold mr-1">Ends in:</span>
      <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-white font-mono font-bold text-sm tracking-widest">{String(timeLeft.h).padStart(2, '0')}h</div>
      <span className="text-white/60 font-bold">:</span>
      <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-white font-mono font-bold text-sm tracking-widest">{String(timeLeft.m).padStart(2, '0')}m</div>
      <span className="text-white/60 font-bold">:</span>
      <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-white font-mono font-bold text-sm tracking-widest">{String(timeLeft.s).padStart(2, '0')}s</div>
    </div>
  )
}

function PromoBanner({ tag, headline, sub, cta, to, bg, accent, showCountdown }) {
  const navigate = useNavigate()
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} onClick={() => navigate(to)} className={`bg-gradient-to-br ${bg} rounded-[28px] p-8 cursor-pointer group hover:shadow-stat transition-shadow flex flex-col items-start`}>
      <span className={`text-label-sm font-bold tracking-widest uppercase ${accent} opacity-80`}>{tag}</span>
      <h3 className="text-headline-md text-white mt-2 mb-3 group-hover:underline">{headline}</h3>
      <p className="text-body-md text-white/70 mb-4 flex-1">{sub}</p>
      {showCountdown && <CountdownTimer />}
      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(to) }}>{cta}</Button>
    </motion.div>
  )
}

function StatBand({ value, suffix = '', label }) {
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-black text-secondary-container mb-1">{value}{suffix}</p>
      <p className="text-label-md text-white/60">{label}</p>
    </div>
  )
}
