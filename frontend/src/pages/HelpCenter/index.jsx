import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Accordion from '@/components/ui/Accordion'
import Button from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/Input'
import useDebounce from '@/hooks/useDebounce'
import { getFAQs } from '@/services/api'

const HELP_CATEGORIES = [
  { icon: 'local_shipping', label: 'Orders & Delivery' },
  { icon: 'refresh', label: 'Returns & Refunds' },
  { icon: 'verified_user', label: 'Account & Login' },
  { icon: 'payments', label: 'Payments' },
  { icon: 'subscriptions', label: 'Subscriptions' },
  { icon: 'restaurant', label: 'Products & Quality' },
]

const SITEMAP = [
  { label: 'Home', to: '/' },
  { label: 'Fish', to: '/category/fish' },
  { label: 'Prawns & Shrimp', to: '/category/prawns-shrimp' },
  { label: 'Crabs', to: '/category/crabs' },
  { label: 'Lobster', to: '/category/lobster' },
  { label: 'Dry Fish', to: '/category/dry-fish' },
  { label: 'Combos', to: '/category/combos' },
  { label: 'Subscriptions', to: '/subscriptions' },
  { label: 'Track Order', to: '/orders/NHS-77421' },
  { label: 'About Us', to: '/about' },
  { label: 'Quality Promise', to: '/quality' },
  { label: 'Store Locator', to: '/stores' },
  { label: 'Wholesale / B2B', to: '/bulk-orders' },
]

export default function HelpCenter() {
  const [allFaqs, setAllFaqs] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    getFAQs().then(setAllFaqs)
  }, [])

  const filteredFaqs = useMemo(() => {
    if (!debouncedSearch) return allFaqs
    const q = debouncedSearch.toLowerCase()
    return allFaqs.filter(
      (f) => f.title.toLowerCase().includes(q) || f.content.toLowerCase().includes(q)
    )
  }, [allFaqs, debouncedSearch])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Search */}
      <section className="py-16 bg-primary" aria-labelledby="help-heading">
        <div className="container-max text-center">
          <h1 id="help-heading" className="text-display-lg-mobile text-white mb-3">
            How can we help you?
          </h1>
          <p className="text-body-lg text-white/70 mb-8">
            Search our FAQ or browse by category.
          </p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: '20px' }} aria-hidden="true">search</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search FAQs… e.g. 'cancel order', 'delivery slots'"
                aria-label="Search help articles"
                className="w-full rounded-full bg-white border-0 pl-11 pr-5 py-4 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary-container shadow-stat"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 bg-surface-container-low border-b border-outline-variant/30" aria-label="Help categories">
        <div className="container-max">
          <div className="flex flex-wrap justify-center gap-4">
            {HELP_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => setSearch(cat.label)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full shadow-sm border border-outline-variant hover:border-primary hover:text-primary transition-all text-label-md font-semibold text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-max py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md text-on-surface">
                {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
              </h2>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-label-md text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">close</span>
                  Clear
                </button>
              )}
            </div>

            {filteredFaqs.length > 0 ? (
              <Accordion items={filteredFaqs} allowMultiple={false} />
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-outline text-5xl mb-3 block" aria-hidden="true">search_off</span>
                <p className="text-headline-sm text-on-surface-variant mb-2">No results found</p>
                <p className="text-body-md text-outline">Try a different search term or contact us below</p>
              </div>
            )}
          </div>

          {/* Sidebar — Contact + Sitemap */}
          <div className="space-y-6">
            {/* Still need help */}
            <div className="bg-white rounded-[28px] shadow-card p-6">
              <h2 className="text-headline-sm text-on-surface mb-4">Still need help?</h2>
              <div className="space-y-3">
                <button
                  className="w-full flex items-center gap-4 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-container transition-colors text-left"
                  onClick={() => {
                    // Mock: open intercom/live chat
                    window.alert('Live Chat is opening... (Mock)')
                  }}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '20px' }} aria-hidden="true">chat</span>
                  </div>
                  <div>
                    <p className="text-label-md font-semibold text-on-surface">Live Chat</p>
                    <p className="text-label-sm text-on-surface-variant">Avg. response: 2 minutes</p>
                  </div>
                </button>

                <a
                  href="tel:+919500829167"
                  className="flex items-center gap-4 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-container transition-colors"
                >
                  <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-success" style={{ fontSize: '20px' }} aria-hidden="true">call</span>
                  </div>
                  <div>
                    <p className="text-label-md font-semibold text-on-surface">Call Us</p>
                    <p className="text-label-sm text-on-surface-variant">+91 95008 29167</p>
                  </div>
                </a>

                <a
                  href="mailto:carenhsalem@gmail.com"
                  className="flex items-center gap-4 p-4 bg-surface-container-low rounded-[16px] hover:bg-surface-container transition-colors"
                >
                  <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: '20px' }} aria-hidden="true">mail</span>
                  </div>
                  <div>
                    <p className="text-label-md font-semibold text-on-surface">Email Support</p>
                    <p className="text-label-sm text-on-surface-variant">carenhsalem@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Sitemap */}
            <div className="bg-surface-container-low rounded-[28px] p-6">
              <h2 className="text-headline-sm text-on-surface mb-4">Quick Links</h2>
              <div className="flex flex-col gap-1">
                {SITEMAP.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-label-md text-on-surface-variant hover:text-primary transition-colors py-1.5 border-b border-outline-variant/20 last:border-0"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
