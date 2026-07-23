import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/ui/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import useToastStore from '@/store/toastStore'
import useAuthStore from '@/store/authStore'
import { getProducts, subscribeNewsletter, getApprovedSiteReviews, submitSiteReview } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Curated Merged Trust Points (6 Non-Overlapping Pillars)
const TRUST_POINTS = [
  { icon: 'phishing', title: 'Premium Fresh Catch', desc: 'Sourced directly from clean & nutrient-rich ocean waters.' },
  { icon: 'ac_unit', title: 'Blast Frozen & Cold Chain', desc: 'Quick freezing within hours locks in authentic texture, taste & nutrition.' },
  { icon: 'sanitizer', title: 'Hygienically Packed', desc: 'Processed & sealed in pristine facilities under strict safety protocols.' },
  { icon: 'verified', title: 'Quality Checked', desc: 'Every batch undergoes rigorous lab quality & freshness inspections.' },
  { icon: 'sentiment_very_satisfied', title: 'Customer Satisfaction', desc: 'Uncompromising reliability, fresh delivery guarantee, and prompt service.' },
  { icon: 'storefront', title: 'Retail & Business Supply', desc: 'Customized portions & wholesale orders for homes, caterers & restaurants.' },
]

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
    bg: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=85',
  },
  {
    id: 3,
    headline: 'Hygienically Packed & Delivered',
    sub: 'Maintained under strict cold-chain conditions right from ocean processing to your doorstep or retail business.',
    cta: 'Shop Fresh Catch',
    badge: 'Cold-Chain Certified',
    bg: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1600&q=85',
  },
]

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const reviewFormSchema = z.object({
  author: z.string().min(2, 'Name is required'),
  role: z.string().min(1, 'Please select your role'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'Please write at least 10 characters for your review'),
})

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
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

  // Fetch best sellers & approved site reviews
  useEffect(() => {
    Promise.all([
      getProducts(),
      getApprovedSiteReviews()
    ])
      .then(([productsData, reviewsRes]) => {
        if (Array.isArray(productsData) && productsData.length > 0) {
          const featured = productsData.filter((p) => p.isBestSeller)
          setBestSellers(featured.length > 0 ? featured.slice(0, 4) : productsData.slice(0, 4))
        }
        if (reviewsRes && reviewsRes.reviews && reviewsRes.reviews.length > 0) {
          setTestimonials(reviewsRes.reviews)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Newsletter form
  const { register: regNewsletter, handleSubmit: handleNewsletterSubmit, formState: { errors: newsletterErrors, isSubmitting: isSubmittingNewsletter }, reset: resetNewsletter } = useForm({
    resolver: zodResolver(newsletterSchema),
  })

  // Review Submission form
  const { register: regReview, handleSubmit: handleReviewSubmit, formState: { errors: reviewErrors, isSubmitting: isSubmittingReview }, reset: resetReview, setValue: setReviewValue, watch: watchReview } = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 5, role: 'Home Buyer' }
  })

  const currentRating = watchReview('rating') || 5

  const onNewsletterSubmit = async ({ email }) => {
    try {
      await subscribeNewsletter(email)
      addToast({ message: `🎉 Subscribed! Check your email for updates.`, type: 'success' })
      resetNewsletter()
    } catch (err) {
      if (err.message === 'You are already subscribed!') {
        addToast({ message: 'You are already subscribed!', type: 'info' })
      } else {
        addToast({ message: err.message || 'Subscription failed. Please try again.', type: 'error' })
      }
    }
  }

  const onReviewSubmit = async (data) => {
    try {
      const res = await submitSiteReview(data)
      addToast({ 
        message: res.message || 'Thanks! Your review is being reviewed and will appear once approved.', 
        type: 'success', 
        duration: 5000 
      })
      resetReview()
      setReviewModalOpen(false)
    } catch (err) {
      addToast({ message: err.message || 'Failed to submit review.', type: 'error' })
    }
  }

  // Calculate placeholder count to maintain intentional 4-grid alignment
  const fillCount = Math.max(0, 4 - bestSellers.length)

  return (
    <div className="bg-slate-50/50 min-h-screen">
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
                
                {/* Brand Blue-tinted Dark Gradient Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#000516]/90 via-[#0b1e3d]/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000516]/80 via-transparent to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="container-max w-full">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-xl">
                      <div className="flex flex-wrap gap-2.5 mb-5">
                        <span className="bg-[#000516]/70 backdrop-blur-md border border-[#fed255]/40 text-[#fed255] font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center">
                          <span className="material-symbols-outlined text-sm mr-1.5 text-[#fed255]">verified</span>
                          {slide.badge}
                        </span>
                        <span className="bg-[#000516]/70 backdrop-blur-md border border-white/20 text-white font-medium text-xs px-3.5 py-1.5 rounded-full flex items-center">
                          <span className="material-symbols-outlined text-[#16a34a] text-sm mr-1.5">local_shipping</span> 
                          Free Delivery Above ₹499
                        </span>
                      </div>

                      <h1 className="text-display-lg-mobile md:text-display-lg font-extrabold text-white mb-4 leading-tight tracking-tight">
                        {slide.headline}
                      </h1>
                      
                      <p className="text-body-lg text-white/90 mb-8 max-w-md leading-relaxed font-normal">
                        {slide.sub}
                      </p>

                      <Button 
                        variant="ghost" 
                        size="lg" 
                        icon="arrow_forward"
                        className="bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 hover:border-white/60 font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg"
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

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(i) }}
              style={{
                width: i === currentSlide ? '10px' : '6px',
                height: i === currentSlide ? '10px' : '6px',
                minWidth: '6px',
                minHeight: '6px',
                padding: 0,
              }}
              className={`rounded-full transition-all duration-300 border-none outline-none ${i === currentSlide ? 'bg-white shadow-sm ring-2 ring-white/40' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </section>

      {/* ── Active Order Banner ───────────────────────────────────────── */}
      {activeOrder && (
        <motion.section 
          initial={{ opacity: 0, y: 15 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="px-4 pt-10 pb-2"
        >
          <div className="container-max max-w-3xl mx-auto">
            <div 
              className="bg-white border border-[#000516]/15 rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all"
              onClick={() => navigate(`/track-order`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#000516]/5 rounded-xl flex items-center justify-center text-[#000516]">
                  <span className="material-symbols-outlined text-[26px]">package_2</span>
                </div>
                <div>
                  <p className="font-bold text-base text-[#000516]">Track Your Active Order</p>
                  <p className="text-sm text-slate-600 mt-0.5">Order #{activeOrder.id} is currently <span className="font-bold text-[#16a34a]">{activeOrder.status}</span></p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#000516]/60 hidden sm:block">arrow_forward_ios</span>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── 2. Today's Best Sellers ───────────────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.4 }}
        className="py-20 bg-white" 
        aria-labelledby="best-sellers-heading"
      >
        <div className="container-max">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-0.5 w-6 bg-[#fed255] rounded-full inline-block" />
                <p className="text-xs text-[#000516] font-extrabold tracking-widest uppercase">✦ Today's Catch</p>
              </div>
              <h2 id="best-sellers-heading" className="text-headline-lg md:text-display-sm font-extrabold text-[#000516]">
                Today's Best Sellers
              </h2>
            </div>
            <Link to="/category/fish" className="hidden sm:flex items-center gap-1.5 text-sm text-[#000516] font-bold hover:underline">
              View all <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              <>
                {bestSellers.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}

                {/* Fill remaining slots with proportional "More Arriving Soon" cards */}
                {fillCount > 0 &&
                  Array.from({ length: fillCount }).map((_, i) => (
                    <motion.div
                      key={`placeholder-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: (bestSellers.length + i) * 0.08 }}
                      className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-slate-50/60 transition-all hover:border-[#000516]/30 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#000516]/5 text-[#000516] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">set_meal</span>
                      </div>
                      <h3 className="font-bold text-[#000516] text-sm mb-1">New Catch Arriving Soon</h3>
                      <p className="text-xs text-slate-500 max-w-[180px] leading-snug">Fresh ocean stock added weekly to our catalog.</p>
                      <span className="mt-3 inline-flex items-center text-[11px] font-semibold text-[#000516] bg-[#fed255]/30 px-3 py-1 rounded-full">
                        Fresh Batches Mon & Thu
                      </span>
                    </motion.div>
                  ))}
              </>
            )}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Button 
              variant="primary" 
              className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold px-8 py-3 rounded-full border-none"
              onClick={() => navigate('/category/fish')}
            >
              View All Products
            </Button>
          </div>
        </div>
      </motion.section>

      {/* ── 3. Merged Trust & Excellence Section (Light Blue Canvas) ───────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.4 }}
        className="py-20 bg-[#F0F5FB] border-y border-blue-100/80"
      >
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-0.5 w-6 bg-[#000516] rounded-full inline-block" />
              <span className="text-[#000516] font-extrabold text-xs uppercase tracking-widest block">The NH Salem Difference</span>
              <span className="h-0.5 w-6 bg-[#000516] rounded-full inline-block" />
            </div>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516] mb-3">Our Quality & Trust Commitment</h2>
            <p className="text-slate-600 text-body-lg">Delivered fresh from ocean waters, blast-frozen & hygienically packaged directly to your doorstep or commercial business.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRUST_POINTS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Card 
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                  highlighted={item.highlighted}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 4. Testimonials & Customer Reviews (Light Gold/Cream Canvas) ──────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.4 }}
        className="py-20 bg-[#FFFBF0] border-b border-amber-100/80"
      >
        <div className="container-max">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-0.5 w-6 bg-[#fed255] rounded-full inline-block" />
                <span className="text-[#000516] font-extrabold text-xs uppercase tracking-widest block">Verified Feedback</span>
              </div>
              <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516]">Loved by Seafood Enthusiasts</h2>
              <p className="text-slate-600 text-body-lg mt-1">Authentic reviews from verified retail and commercial buyers.</p>
            </div>
            
            <Button
              variant="ghost"
              icon="arrow_forward"
              onClick={() => setReviewModalOpen(true)}
              className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold px-6 py-3 rounded-full border-none shadow-md self-start md:self-auto shrink-0"
            >
              Write a Review
            </Button>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    <div className="flex gap-1 text-[#fed255] mb-4">
                      {Array.from({ length: t.rating || 5 }).map((_, r) => (
                        <span key={r} className="material-symbols-outlined text-xl filled">star</span>
                      ))}
                    </div>
                    <p className="text-slate-700 text-body-md leading-relaxed italic mb-6">"{t.quote || t.comment}"</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 bg-[#000516]/5 text-[#000516]">
                      {(t.author || 'Customer').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-[#000516] text-sm leading-none mb-1">{t.author}</p>
                      <p className="text-xs text-slate-500 leading-none">{t.role || 'Verified Customer'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-amber-100 text-center max-w-lg mx-auto shadow-sm">
              <span className="material-symbols-outlined text-4xl text-[#000516] mb-3">rate_review</span>
              <h3 className="font-bold text-[#000516] text-lg mb-1">Be the First to Review</h3>
              <p className="text-slate-600 text-sm mb-5">Share your experience with NH Salem Sea Foods.</p>
              <Button
                variant="ghost"
                icon="arrow_forward"
                onClick={() => setReviewModalOpen(true)}
                className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold px-6 py-2.5 rounded-full border-none shadow-md"
              >
                Write a Review
              </Button>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Write a Review Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Share Your Feedback"
        size="md"
      >
        <form onSubmit={handleReviewSubmit(onReviewSubmit)} className="space-y-4 p-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Your Name *</label>
            <input
              type="text"
              placeholder="e.g. Ramesh K."
              {...regReview('author')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#000516]"
            />
            {reviewErrors.author && <p className="text-xs text-red-500 mt-1">{reviewErrors.author.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Buyer Category *</label>
            <select
              {...regReview('role')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#000516] bg-white"
            >
              <option value="Home Buyer">Home Buyer</option>
              <option value="Restaurant Partner">Restaurant Partner</option>
              <option value="Retailer / Wholesaler">Retailer / Wholesaler</option>
              <option value="Culinary Professional">Culinary Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Rating *</label>
            <div className="flex gap-2 text-[#fed255]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewValue('rating', star)}
                  className="focus:outline-none"
                >
                  <span className={`material-symbols-outlined text-2xl ${star <= currentRating ? 'filled' : ''}`}>
                    star
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Review Details *</label>
            <textarea
              rows={4}
              placeholder="Tell us about the freshness, packaging, and delivery..."
              {...regReview('comment')}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#000516]"
            />
            {reviewErrors.comment && <p className="text-xs text-red-500 mt-1">{reviewErrors.comment.message}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              className="rounded-full px-5 py-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmittingReview}
              className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold rounded-full px-6 py-2 text-sm border-none shadow-md"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Newsletter (Pure White Canvas) ───────────────────────────────── */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.4 }}
        className="py-20 bg-white" 
        aria-labelledby="newsletter-heading"
      >
        <div className="container-max max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-[#000516]/5 text-[#000516] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </div>
          <h2 id="newsletter-heading" className="text-headline-lg font-extrabold text-[#000516] mb-3">Stay in the Loop</h2>
          <p className="text-body-lg text-slate-600 mb-8">Get early access to fresh catches, seasonal offers, and wholesale updates straight to your inbox.</p>
          
          <form onSubmit={handleNewsletterSubmit(onNewsletterSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" noValidate>
            <div className="flex-1">
              <input 
                type="email" 
                placeholder="your@email.com" 
                {...regNewsletter('email')} 
                className="w-full rounded-full bg-slate-50 border border-slate-300 px-5 py-3.5 text-body-md text-[#000516] placeholder:text-slate-400 focus:border-[#000516] focus:ring-2 focus:ring-[#000516]/15 outline-none transition-all" 
              />
              {newsletterErrors.email && <p className="text-label-sm text-error mt-1.5 text-left pl-3">{newsletterErrors.email.message}</p>}
            </div>
            <Button 
              type="submit" 
              variant="ghost"
              icon="arrow_forward" 
              loading={isSubmittingNewsletter} 
              className="bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold rounded-full px-8 py-3.5 border-none shadow-md"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </motion.section>
    </div>
  )
}
