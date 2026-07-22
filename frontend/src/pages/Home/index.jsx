import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { getProducts, subscribeNewsletter } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Enterprise Data Arrays
const COMMITMENT = [
  { icon: 'set_meal', title: 'Freshness', desc: 'Sourced directly to preserve natural ocean freshness for your family.' },
  { icon: 'workspace_premium', title: 'Quality', desc: 'Strict selection meeting international quality and safety standards.' },
  { icon: 'clean_hands', title: 'Hygiene', desc: 'Processed under immaculate, ultra-clean standards at every step.' },
  { icon: 'sentiment_very_satisfied', title: 'Customer Satisfaction', desc: 'Uncompromising service, reliability, and guaranteed quality.' },
];

const WHY_CHOOSE_US = [
  { icon: 'phishing', title: 'Premium Fresh Catch', desc: 'Sourced from clean & rich ocean waters.' },
  { icon: 'ac_unit', title: 'Blast Frozen', desc: 'Quick freezing locks in freshness & essential nutrients.' },
  { icon: 'severe_cold', title: 'Cold Chain Maintained', desc: 'Proper storage & transport ensures premium quality.' },
  { icon: 'sanitizer', title: 'Hygienically Packed', desc: 'Packed under strict hygiene standards for your safety.' },
  { icon: 'storefront', title: 'Retail & Business Supply', desc: 'Perfect for homes, retailers, caterers & restaurants.' },
  { icon: 'verified', title: 'Quality Checked', desc: 'Every batch undergoes rigorous quality inspections.' },
];

const TESTIMONIALS = [
  {
    quote: "The quality of prawns and seamouth fish is unbeatable. Freshness locked in, perfect packaging!",
    author: "Ramesh K.",
    role: "Regular Customer",
    rating: 5,
  },
  {
    quote: "NH Salem has become our primary seafood supplier for our restaurant. Consistent quality and reliable cold-chain delivery.",
    author: "Chef Ananth M.",
    role: "Hotel & Culinary Partner",
    rating: 5,
  },
  {
    quote: "Hygienic, zero odor when unboxing, and tastes just like day-one fresh catch. Highly recommended!",
    author: "Priya S.",
    role: "Verified Home Buyer",
    rating: 5,
  },
];

const HERO_SLIDES = [
  {
    id: 1,
    headline: 'NH Salem Sea Foods',
    sub: 'Committed to delivering premium quality frozen seafood that preserves natural freshness, authentic taste, and rich nutritional value.',
    cta: 'Shop Fresh Catch',
    badge: 'Premium Quality',
    bg: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=1600&q=85',
  },
  {
    id: 2,
    headline: 'Ocean Freshness Guaranteed',
    sub: 'Sourced from clean & rich ocean waters, blast-frozen within hours to lock in natural texture and taste.',
    cta: 'Shop Fresh Catch',
    badge: '100% Ocean Fresh',
    bg: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1600&q=85',
  },
  {
    id: 3,
    headline: 'Hygienically Packed & Delivered',
    sub: 'Maintained under strict cold-chain conditions right from ocean processing to your doorstep or retail business.',
    cta: 'Shop Fresh Catch',
    badge: 'Cold-Chain Certified',
    bg: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1600&q=85',
  },
];

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  // Active order banner state
  const [activeOrder, setActiveOrder] = useState(null)
  
  useEffect(() => {
    if (user) {
      setActiveOrder({ id: 'NHS-77421', status: 'Out for Delivery' })
    } else {
      setActiveOrder(null)
    }
  }, [user])

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentSlide])

  // Fetch best sellers with fallback to any active products if isBestSeller flag is false
  useEffect(() => {
    getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const featured = data.filter((p) => p.isBestSeller)
          setBestSellers(featured.length > 0 ? featured.slice(0, 4) : data.slice(0, 4))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
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
    <div className="bg-background">
      {/* ── 1. Hero Carousel ────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[520px] max-h-[720px] overflow-hidden bg-[#000516]">
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
                
                {/* Enterprise Dark Gradient Scrim Overlay for WCAG AA Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000516]/90 via-[#000516]/65 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000516]/80 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="container-max w-full">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-xl">
                      <div className="flex flex-wrap gap-2.5 mb-5">
                        <span className="bg-[#fed255] text-[#000516] font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm">
                          {slide.badge}
                        </span>
                        <span className="bg-[#000516]/75 backdrop-blur-md border border-white/20 text-white font-medium text-xs px-3.5 py-1.5 rounded-full flex items-center">
                          <span className="material-symbols-outlined text-[#16a34a] text-sm mr-1.5">local_shipping</span> 
                          Free Delivery Above ₹499
                        </span>
                      </div>

                      <h1 className="text-display-lg-mobile md:text-display-lg font-extrabold text-white mb-4 leading-tight tracking-tight">
                        {slide.headline}
                      </h1>
                      
                      <p className="text-body-lg text-white/85 mb-8 max-w-md leading-relaxed font-normal">
                        {slide.sub}
                      </p>

                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="bg-[#fed255] hover:bg-[#e0b743] text-[#000516] font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={(e) => { e.stopPropagation(); navigate('/category/fish') }}
                      >
                        {slide.cta}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(i) }}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-[#fed255]' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      {/* ── 2. Active Order Persistent Banner ─────────────────────────── */}
      {activeOrder && (
        <section className="px-4 py-6 bg-background">
          <div className="container-max max-w-3xl mx-auto">
            <div 
              className="bg-gradient-to-r from-[#000516] to-[#0b1e3d] border border-white/10 text-white rounded-2xl p-5 flex items-center justify-between shadow-stat cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(`/track-order`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fed255]/15 rounded-xl flex items-center justify-center text-[#fed255]">
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>package_2</span>
                </div>
                <div>
                  <p className="font-bold text-headline-sm leading-tight text-white">Track Your Active Order</p>
                  <p className="text-sm text-white/80 mt-0.5">Order #{activeOrder.id} is currently <span className="font-bold text-[#16a34a]">{activeOrder.status}</span></p>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/80 hidden sm:block">arrow_forward_ios</span>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Today's Best Sellers ───────────────────────────────────────── */}
      <section className="py-20 bg-surface-container-low" aria-labelledby="best-sellers-heading">
        <div className="container-max">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs text-[#000516] font-bold tracking-widest uppercase mb-2">✦ Today's Catch</p>
              <h2 id="best-sellers-heading" className="text-headline-lg md:text-display-sm font-extrabold text-on-surface">
                Today's Best Sellers
              </h2>
            </div>
            <Link to="/category/fish" className="hidden sm:flex items-center gap-1.5 text-sm text-[#000516] font-bold hover:underline">
              View all <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading 
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />) 
              : bestSellers.map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Button variant="secondary" onClick={() => navigate('/category/fish')}>View All Products</Button>
          </div>
        </div>
      </section>

      {/* ── 4. Our Commitment ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#000516] text-white">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#fed255] font-bold text-xs uppercase tracking-widest block mb-2">Our Promise</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-white mb-4">Our Commitment</h2>
            <p className="text-white/75 text-body-lg">Delivering natural freshness, authentic taste, and nutritional value from ocean to table.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMITMENT.map((item, i) => (
              <Card 
                key={i}
                variant="dark"
                icon={item.icon}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Why Choose Us ───────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#000516] font-bold text-xs uppercase tracking-widest block mb-2">The NH Salem Difference</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-on-surface mb-4">Why Choose Us</h2>
            <p className="text-on-surface-variant text-body-lg">Hygienically processed and maintained under strict cold-chain conditions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_CHOOSE_US.map((item, i) => (
              <Card 
                key={i}
                variant="light"
                icon={item.icon}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Highlight Strip Banner ───────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-[#000516] via-[#0b1e3d] to-[#000516] text-white border-y border-white/10">
        <div className="container-max text-center">
          <div className="w-14 h-14 rounded-full bg-[#fed255]/15 text-[#fed255] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">ac_unit</span>
          </div>
          <h2 className="text-headline-lg md:text-display-sm font-extrabold mb-3 text-white">
            Fresh From The Ocean, Frozen For Freshness
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-body-lg">
            Hygienically processed & cold-chain maintained right to your doorstep or business.
          </p>
        </div>
      </section>

      {/* ── 7. Testimonials & Customer Reviews ────────────────────────────── */}
      <section className="py-20 bg-surface-container-low">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[#000516] font-bold text-xs uppercase tracking-widest block mb-2">Trust & Feedback</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-on-surface mb-4">Loved by Seafood Enthusiasts</h2>
            <p className="text-on-surface-variant text-body-lg">Here is what our retail & wholesale customers say about our quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#fed255] mb-4">
                    {Array.from({ length: t.rating }).map((_, r) => (
                      <span key={r} className="material-symbols-outlined text-xl filled">star</span>
                    ))}
                  </div>
                  <p className="text-on-surface text-body-md leading-relaxed italic mb-6">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t border-outline-variant/60">
                  <p className="font-bold text-on-surface text-sm">{t.author}</p>
                  <p className="text-xs text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Newsletter ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-outline-variant" aria-labelledby="newsletter-heading">
        <div className="container-max max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#000516]/5 text-[#000516] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <h2 id="newsletter-heading" className="text-headline-lg font-extrabold text-on-surface mb-3">Stay in the Loop</h2>
          <p className="text-body-lg text-on-surface-variant mb-8">Get early access to fresh catches, seasonal offers, and wholesale updates straight to your inbox.</p>
          
          <form onSubmit={handleSubmit(onNewsletterSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
            <div className="flex-1">
              <input 
                type="email" 
                placeholder="your@email.com" 
                {...register('email')} 
                className="w-full rounded-full bg-white border border-outline-variant px-5 py-3.5 text-body-md text-on-surface placeholder:text-outline focus:border-[#000516] focus:ring-2 focus:ring-[#000516]/15 outline-none transition-all" 
              />
              {errors.email && <p className="text-label-sm text-error mt-1.5 text-left pl-3">{errors.email.message}</p>}
            </div>
            <Button type="submit" variant="primary" loading={isSubmitting} className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold rounded-full px-8 py-3.5">
              Subscribe
            </Button>
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
