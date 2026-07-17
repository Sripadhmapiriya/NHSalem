import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import Icon from '@/components/ui/Icon'
import useToastStore from '@/store/toastStore'
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

const USP_ITEMS = [
  { icon: 'verified', label: 'No Antibiotics', sublabel: 'Certified chemical-free' },
  { icon: 'replay', label: 'Easy Returns', sublabel: '2-hour freshness guarantee' },
  { icon: 'ac_unit', label: 'Cold-Chain Packed', sublabel: '0–4°C throughout' },
  { icon: 'schedule', label: 'Under 24 Hours', sublabel: 'Coast to kitchen' },
]

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  // Stats band
  const [statsRef, statsInView] = useInView({ once: true })
  const cities = useCountUp(8, 1800, statsInView)
  const orders = useCountUp(50000, 2000, statsInView)
  const partners = useCountUp(120, 1600, statsInView)

  // Auto-advance carousel (resets timer when currentSlide changes)
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
      <section
        className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden"
        aria-label="Featured promotions"
      >
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
                <img
                  src={slide.bg}
                  alt={slide.headline}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-hero-gradient" />
                {/* Hover overlay visual affordance */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container-max w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="max-w-xl"
                    >
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="premium">{slide.badge}</Badge>
                        <Badge variant="glass" className="bg-[#0b1e3d]/40 backdrop-blur-md border border-white/20 text-white">
                          <span className="material-symbols-outlined text-[#4ADE80] text-[13px] mr-1">local_shipping</span>
                          Free Delivery Above ₹499
                        </Badge>
                        <Badge variant="glass" className="bg-[#0b1e3d]/40 backdrop-blur-md border border-white/20 text-white">
                          <span className="material-symbols-outlined text-[#60A5FA] text-[13px] mr-1">schedule</span>
                          Same-Day Delivery
                        </Badge>
                      </div>
                      <h1 className="text-display-lg-mobile md:text-display-lg text-white mb-4 leading-tight">
                        {slide.headline}
                      </h1>
                      <p className="text-body-lg text-white/80 mb-8 max-w-md">
                        {slide.sub}
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(slide.ctaTo)
                        }}
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

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentSlide(i)
              }}
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors duration-300 ${
                i === currentSlide ? 'bg-white shadow-sm' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── USP Band ───────────────────────────────────────────────────── */}
      <section className="bg-primary py-6" aria-label="Key benefits">
        <div className="container-max">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USP_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-secondary-container/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '20px' }} aria-hidden="true">
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-semibold text-white">{item.label}</p>
                  <p className="text-label-sm text-white/60 hidden sm:block">{item.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Today's Best Sellers ───────────────────────────────────────── */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="best-sellers-heading">
        <div className="container-max">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">
                ✦ Today's Catch
              </p>
              <h2 id="best-sellers-heading" className="text-display-lg-mobile text-on-surface">
                Today's Best Sellers
              </h2>
            </div>
            <Link
              to="/category/fish"
              className="hidden sm:flex items-center gap-1.5 text-label-md text-primary font-semibold hover:underline"
            >
              View all <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="secondary" onClick={() => navigate('/category/fish')}>
              View All Products
            </Button>
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
            bg="from-tertiary-container to-primary"
            accent="text-on-tertiary-container"
          />
          <PromoBanner
            tag="FIRST ORDER"
            headline="First Order? Get ₹200 Cashback"
            sub="Use code WELCOME200 at checkout. Valid on orders above ₹499."
            cta="Shop Now"
            to="/category/fish"
            bg="from-primary-container to-primary"
            accent="text-secondary-container"
          />
        </div>
      </section>

      {/* ── Stats Band ─────────────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="py-16 bg-primary"
        aria-label="NH Salem by the numbers"
      >
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <StatBand value={cities} suffix="Live" label="Salem Delivery Hubs" />
            <StatBand value={orders.toLocaleString()} label="Satisfied Customers" />
            <StatBand value={partners} suffix="+" label="Fishing Partners" />
          </div>
        </div>
      </section>

      {/* ── Category Grid ──────────────────────────────────────────────── */}
      <section className="py-16 bg-background" aria-labelledby="categories-heading">
        <div className="container-max">
          <div className="text-center mb-10">
            <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">
              Our Range
            </p>
            <h2 id="categories-heading" className="text-display-lg-mobile text-on-surface">
              Shop by Category
            </h2>
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
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
              >
                <Link
                  to={`/category/${cat.slug}`}
                  className={`flex flex-col items-center gap-3 p-5 ${cat.color} rounded-[20px] hover:shadow-card transition-all duration-200 hover:-translate-y-1 group`}
                  aria-label={`Browse ${cat.label}`}
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-card transition-shadow">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }} aria-hidden="true">
                      {cat.icon}
                    </span>
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
          <span className="material-symbols-outlined text-secondary text-4xl mb-4 block" aria-hidden="true">
            mail
          </span>
          <h2 id="newsletter-heading" className="text-display-lg-mobile text-on-surface mb-3">
            Stay in the Loop
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Get early access to flash sales, new arrivals, and seasonal catches straight to your inbox.
          </p>

          <form
            onSubmit={handleSubmit(onNewsletterSubmit)}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            noValidate
            aria-label="Newsletter subscription"
          >
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'newsletter-error' : undefined}
                className="w-full rounded-full bg-white border border-outline-variant px-5 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none"
              />
              {errors.email && (
                <p id="newsletter-error" role="alert" className="text-label-sm text-error mt-1.5 text-left pl-2">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PromoBanner({ tag, headline, sub, cta, to, bg, accent }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={() => navigate(to)}
      className={`bg-gradient-to-br ${bg} rounded-[28px] p-8 cursor-pointer group hover:shadow-stat transition-shadow`}
    >
      <span className={`text-label-sm font-bold tracking-widest uppercase ${accent} opacity-80`}>
        {tag}
      </span>
      <h3 className="text-headline-md text-white mt-2 mb-3 group-hover:underline">{headline}</h3>
      <p className="text-body-md text-white/70 mb-6">{sub}</p>
      <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(to) }}>
        {cta}
      </Button>
    </motion.div>
  )
}

function StatBand({ value, suffix = '', label }) {
  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-black text-secondary-container mb-1">
        {value}{suffix}
      </p>
      <p className="text-label-md text-white/60">{label}</p>
    </div>
  )
}
