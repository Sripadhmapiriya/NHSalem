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
import { getProducts, getApprovedSiteReviews, submitSiteReview, subscribeNewsletter } from '@/services/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 6 Core Trust Pillars
const TRUST_POINTS = [
  { icon: 'phishing', title: 'Premium Fresh Catch', desc: 'Sourced directly from clean & nutrient-rich ocean waters.' },
  { icon: 'ac_unit', title: 'Blast Frozen & Cold Chain', desc: 'Quick freezing within hours locks in authentic texture, taste & nutrition.' },
  { icon: 'sanitizer', title: 'Hygienically Packed', desc: 'Processed & sealed in pristine facilities under strict safety protocols.' },
  { icon: 'verified', title: 'Quality Checked', desc: 'Every batch undergoes rigorous lab quality & freshness inspections.' },
  { icon: 'sentiment_very_satisfied', title: 'Customer Satisfaction', desc: 'Uncompromising reliability, fresh delivery guarantee, and prompt service.' },
  { icon: 'storefront', title: 'Retail & Business Supply', desc: 'Customized portions & wholesale orders for homes, caterers & restaurants.' },
]

// 4 Distinct About Commitment Cards with 4 Unique Icons
const ABOUT_COMMITMENTS = [
  { icon: 'water_drop', title: 'Freshness', desc: 'We ensure the freshest ocean catch for you & your family.' },
  { icon: 'workspace_premium', title: 'Quality', desc: 'Only the best seafood that meets stringent quality & grading standards.' },
  { icon: 'sanitizer', title: 'Hygiene', desc: 'Maintaining pristine hygiene at every step of storage & handling.' },
  { icon: 'sentiment_very_satisfied', title: 'Customer Satisfaction', desc: 'Your trust, safety, and satisfaction are our top priorities.' },
]

// Genuine Seafood & Ocean Photography (No Fork-and-Knife Mismatches)
const HERO_SLIDES = [
  {
    id: 1,
    headline: 'NH Salem Sea Foods',
    sub: 'Committed to delivering premium quality frozen seafood that preserves natural freshness, authentic taste, and rich nutritional value.',
    cta: 'Shop Fresh Catch',
    badge: 'Premium Quality',
    bg: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=1600&q=85',
  },
  {
    id: 2,
    headline: 'Ocean Freshness Guaranteed',
    sub: 'Sourced from clean & rich ocean waters, blast-frozen within hours to lock in natural texture and taste.',
    cta: 'Shop Fresh Catch',
    badge: '100% Ocean Fresh',
    bg: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=1600&q=85',
  },
  {
    id: 3,
    headline: 'Hygienically Packed & Delivered',
    sub: 'Maintained under strict cold-chain conditions right from ocean processing to your doorstep or retail business.',
    cta: 'Shop Fresh Catch',
    badge: 'Cold-Chain Certified',
    bg: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1600&q=85',
  },
]

const reviewFormSchema = z.object({
  author: z.string().min(2, 'Name is required'),
  role: z.string().min(1, 'Please select your role'),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, 'Please write at least 10 characters for your review'),
})

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contact: z.string().min(5, 'Please provide phone or email'),
  message: z.string().min(10, 'Please write a message of at least 10 characters'),
})

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bestSellers, setBestSellers] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  
  // Contact state
  const [contactSubmitting, setContactSubmitting] = useState(false)

  const { addToast } = useToastStore()
  const navigate = useNavigate()

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentSlide])

  // Fetch best sellers & approved site reviews dynamically from backend database
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
        if (reviewsRes && reviewsRes.success && Array.isArray(reviewsRes.reviews) && reviewsRes.reviews.length > 0) {
          // Display ONLY real, admin-approved reviews from database
          setTestimonials(reviewsRes.reviews)
        } else {
          setTestimonials([])
        }
      })
      .catch(() => {
        setTestimonials([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Review Form
  const { register: regReview, handleSubmit: handleReviewSubmit, formState: { errors: reviewErrors, isSubmitting: isSubmittingReview }, reset: resetReview, setValue: setReviewValue, watch: watchReview } = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 5, role: 'Home Buyer' }
  })
  const currentRating = watchReview('rating') || 5

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

  // Contact Form
  const { register: regContact, handleSubmit: handleContactSubmit, formState: { errors: contactErrors }, reset: resetContact } = useForm({
    resolver: zodResolver(contactFormSchema)
  })

  const onContactSubmit = async (data) => {
    setContactSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      addToast({ message: 'Thank you! Your message has been sent to NH Salem team.', type: 'success', duration: 5000 })
      resetContact()
    } catch (err) {
      addToast({ message: 'Failed to send message.', type: 'error' })
    } finally {
      setContactSubmitting(false)
    }
  }

  // Newsletter Submit
  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      addToast({ message: 'Please enter a valid email address.', type: 'error' })
      return
    }
    setNewsletterSubmitting(true)
    try {
      const res = await subscribeNewsletter(newsletterEmail.trim())
      if (res.success) {
        addToast({ message: res.message || '🎉 Thank you for subscribing to NH Salem updates!', type: 'success', duration: 5000 })
        setNewsletterEmail('')
      } else {
        addToast({ message: res.message || 'Failed to subscribe.', type: 'error' })
      }
    } catch (err) {
      addToast({ message: err.message || 'Failed to subscribe.', type: 'error' })
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  const fillCount = Math.max(0, 4 - bestSellers.length)

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* ── 1. Hero Carousel (#hero) ────────────────────────────────────────────── */}
      <section id="hero" className="relative h-[70vh] min-h-[520px] max-h-[720px] overflow-hidden bg-[#000516]">
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
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-[8000ms] ease-out"
                  style={{ backgroundImage: `url(${slide.bg})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000516]/95 via-[#000516]/75 to-transparent" />

                <div className="container-max relative h-full flex flex-col justify-center text-left text-white z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-2xl"
                  >
                    <span className="inline-block px-3.5 py-1.5 rounded-full bg-[#fed255]/20 border border-[#fed255]/40 text-[#fed255] text-xs font-bold uppercase tracking-wider mb-4">
                      {slide.badge}
                    </span>
                    <h1 className="text-display-lg-mobile md:text-display-lg text-white font-extrabold mb-4 leading-tight">
                      {slide.headline}
                    </h1>
                    <p className="text-body-lg text-slate-200 mb-8 max-w-xl leading-relaxed">
                      {slide.sub}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Glassmorphism CTA Button with Backdrop Blur */}
                      <Link to="/category">
                        <button
                          type="button"
                          className="px-8 py-3.5 rounded-full text-white font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 cursor-pointer select-none"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.35)',
                            boxShadow: '0 8px 32px 0 rgba(0, 5, 22, 0.37)'
                          }}
                        >
                          <span>{slide.cta}</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Very small, subtle 6px micro-dots */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2 pointer-events-auto">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300 cursor-pointer flex-shrink-0"
              style={{
                width: i === currentSlide ? '20px' : '6px',
                height: '6px',
                minWidth: i === currentSlide ? '20px' : '6px',
                minHeight: '6px',
                maxWidth: i === currentSlide ? '20px' : '6px',
                maxHeight: '6px',
                borderRadius: '9999px',
                backgroundColor: i === currentSlide ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                boxShadow: i === currentSlide ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                padding: 0,
                margin: 0,
                border: 'none',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            />
          ))}
        </div>
      </section>

      {/* ── 2. Featured Best Sellers (#bestsellers) — Core Conversion Content First ── */}
      <section id="bestsellers" className="py-20 bg-white border-b border-slate-100 scroll-mt-16">
        <div className="container-max">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Customer Favorites</span>
              <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516]">Featured Best Sellers</h2>
            </div>
            <Link to="/category">
              <Button variant="outline" size="sm" icon="arrow_forward" className="rounded-full px-5">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              <>
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {Array.from({ length: fillCount }).map((_, i) => (
                  <div key={`fill-${i}`} className="bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-5 text-center min-h-[240px]">
                    <span className="material-symbols-outlined text-slate-400 text-3xl mb-1.5">set_meal</span>
                    <p className="font-bold text-slate-700 text-xs sm:text-sm mb-1">Fresh Catch Arriving Soon</p>
                    <p className="text-[11px] text-slate-500 mb-3 max-w-[180px]">New seasonal items are currently being processed.</p>
                    <Link to="/category">
                      <Button variant="ghost" size="xs" className="text-xs text-primary font-bold py-1">
                        Browse Shop
                      </Button>
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. About Us Section (#about) ─────────────────────────────────── */}
      <section id="about" className="py-20 bg-slate-50 border-b border-slate-200/60 scroll-mt-16">
        <div className="container-max">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[#000516] font-extrabold text-xs uppercase tracking-widest block mb-2">Our Story & Purpose</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516] mb-4">About NH Salem Sea Foods</h2>
            <p className="text-slate-600 text-body-lg leading-relaxed">
              NH Salem Sea Foods is committed to delivering premium quality frozen seafood that preserves natural freshness, authentic taste, and nutritional value. Every product is carefully selected from trusted ocean sources, hygienically processed, and maintained under strict cold-chain conditions from the coast to your table. We proudly serve homes, restaurants, hotels, caterers, and retailers with reliable seafood products and customer-focused service.
            </p>
          </div>

          {/* 4 Core Commitment Cards with 4 DISTINCT Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ABOUT_COMMITMENTS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined font-bold text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-black text-[#000516] mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Trust & Why Choose Us (#trust) — Single Consolidated Version ── */}
      <section id="trust" className="py-20 bg-white border-b border-slate-100 scroll-mt-16">
        <div className="container-max">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#000516] font-extrabold text-xs uppercase tracking-widest block mb-2">Uncompromising Reliability</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516]">Why Customers Trust NH Salem</h2>
            <p className="text-slate-600 text-body-md mt-1">Strict quality standards from ocean catch to cold-chain delivery.</p>
          </div>

          {/* 6 Core Trust Cards - All Uniform Icon Circles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {TRUST_POINTS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
              >
                <Card 
                  icon={item.icon}
                  title={item.title}
                  desc={item.desc}
                />
              </motion.div>
            ))}
          </div>

          {/* Dark Ocean Process Accent Strip */}
          <div className="py-5 px-8 bg-[#000516] text-white rounded-2xl flex flex-wrap items-center justify-around gap-4 text-center shadow-lg">
            <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><span className="material-symbols-outlined text-[#fed255]">ac_unit</span> Stored at -18°C</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><span className="material-symbols-outlined text-[#fed255]">star</span> Premium Frozen</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><span className="material-symbols-outlined text-[#fed255]">health_and_safety</span> Hygienic & Safe</span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><span className="material-symbols-outlined text-[#fed255]">inventory_2</span> Cold Chain Maintained</span>
          </div>
        </div>
      </section>

      {/* ── 5. Verified Customer Reviews (#reviews) ───────────────────────── */}
      <section id="reviews" className="py-20 bg-[#FFFBF0] border-b border-amber-100/80 scroll-mt-16">
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
      </section>

      {/* ── 6. Contact Us & Embedded Newsletter Section (#contact) ───────────── */}
      <section id="contact" className="py-20 bg-white scroll-mt-16">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-extrabold text-xs uppercase tracking-widest block mb-2">Reach Out to Us</span>
            <h2 className="text-headline-lg md:text-display-sm font-extrabold text-[#000516] mb-3">Get in Touch with NH Salem</h2>
            <p className="text-slate-600 text-body-md">
              Have questions about retail purchases, bulk orders, custom portioning, or delivery schedules? Our team is available 7 days a week.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Information Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Phone */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-xl">call</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#000516] text-sm mb-0.5">Customer Support Phone</h3>
                  <p className="text-xs text-slate-500 mb-1">Direct support & order inquiries</p>
                  <a href="tel:+919500829167" className="text-primary font-bold text-base hover:underline block">
                    +91 95008 29167
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#000516] text-sm mb-0.5">Email Support</h3>
                  <p className="text-xs text-slate-500 mb-1">General inquiries & feedback</p>
                  <a href="mailto:carenhsalem@gmail.com" className="text-primary font-bold text-sm hover:underline block">
                    carenhsalem@gmail.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                  <span className="material-symbols-outlined text-xl">location_on</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#000516] text-sm mb-0.5">Store & Processing Unit</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    NH Salem Sea Foods, Main Road, Salem, Tamil Nadu - 636001
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="w-11 h-11 bg-[#fed255]/30 rounded-xl flex items-center justify-center shrink-0 text-[#000516]">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#000516] text-sm mb-0.5">Operating Hours</h3>
                  <p className="text-xs text-slate-700 font-medium">Monday – Sunday: 6:00 AM – 9:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Form (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
              <h3 className="font-extrabold text-[#000516] text-xl mb-1">Send Us a Direct Message</h3>
              <p className="text-xs text-slate-500 mb-6">Fill in your details below and our team will get back to you promptly.</p>

              <form onSubmit={handleContactSubmit(onContactSubmit)} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    {...regContact('name')}
                    className="w-full bg-white rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                  {contactErrors.name && <p className="text-xs text-red-500 mt-1">{contactErrors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Phone Number or Email *</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210 or name@example.com"
                    {...regContact('contact')}
                    className="w-full bg-white rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                  {contactErrors.contact && <p className="text-xs text-red-500 mt-1">{contactErrors.contact.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#000516] uppercase tracking-wider mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you today?"
                    {...regContact('message')}
                    className="w-full bg-white rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  />
                  {contactErrors.message && <p className="text-xs text-red-500 mt-1">{contactErrors.message.message}</p>}
                </div>

                <Button
                  type="submit"
                  loading={contactSubmitting}
                  className="w-full bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold py-3.5 rounded-xl border-none shadow-md mt-2"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Embedded Compact Newsletter Signup Strip at bottom of Contact section */}
          <div className="mt-14 pt-8 border-t border-slate-200/80">
            <div className="bg-[#000516] text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="text-left max-w-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#fed255] text-lg">mail</span>
                  <span className="text-xs font-bold text-[#fed255] uppercase tracking-wider">Stay Connected</span>
                </div>
                <h3 className="font-extrabold text-white text-lg md:text-xl">Prefer Email Updates over a Call?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Subscribe to get early access to fresh ocean catches, price updates, and seasonal wholesale offers.
                </p>
              </div>

              <form onSubmit={handleNewsletterSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full px-5 py-2.5 text-xs outline-none focus:border-[#fed255] focus:bg-white/15 min-w-[240px]"
                />
                <Button
                  type="submit"
                  loading={newsletterSubmitting}
                  className="bg-[#fed255] hover:bg-[#e0b435] text-[#000516] font-bold px-6 py-2.5 rounded-full border-none shadow-md text-xs whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  )
}
