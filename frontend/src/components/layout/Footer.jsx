import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Quality Promise', to: '/quality' },
    { label: 'Store Locator', to: '/stores' },
    { label: 'Wholesale / B2B', to: '/bulk-orders' },
  ],
  'Categories': [
    { label: 'Fish', to: '/category/fish' },
    { label: 'Prawns & Shrimp', to: '/category/prawns-shrimp' },
    { label: 'Crabs', to: '/category/crabs' },
    { label: 'Lobster', to: '/category/lobster' },
    { label: 'Dry Fish', to: '/category/dry-fish' },
    { label: 'Combos', to: '/category/combos' },
    { label: 'Shellfish', to: '/category/shellfish' },
  ],
  'Support': [
    { label: 'Help Center', to: '/help' },
    { label: 'Track Order', to: '/orders/NHS-77421' },
    { label: 'Subscriptions', to: '/subscriptions' },
    { label: 'Contact Us', to: '/help' },
    { label: 'Sitemap', to: '/help' },
  ],
}

/**
 * Footer — Deep Navy background, logo on white rounded-rect "plate"
 */
export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary mt-auto border-t border-white/5" aria-label="Site footer">
      <div className="container-max pt-16 pb-8">
        {/* Top grid - 5 columns: Brand (2 spans) + Links (3 spans) to make 2fr 1fr 1fr 1fr */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 pb-12 border-b border-white/10 items-start">
          {/* Brand block (taking up 2/5ths of the grid width) */}
          <div className="lg:col-span-2 flex flex-col items-start pt-2 lg:pt-3">
            {/* Logo on white plate */}
            <div className="inline-flex items-center gap-3.5 bg-white border border-outline-variant/30 rounded-[14px] p-2.5 mb-5 select-none">
              <img
                src="/crest.jpg"
                alt="NH Salem Sea Foods Crest"
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <div className="text-left">
                <p className="text-label-md font-bold text-primary leading-tight">NH Salem</p>
                <p className="text-label-sm text-on-surface-variant leading-normal mt-0.5">Sea Foods</p>
              </div>
            </div>

            <p className="text-body-md text-white/60 leading-relaxed mb-5 max-w-sm">
              Premium seafood sourced fresh from India's coastal fishing partners, delivered to your door within 24 hours.
            </p>

            {/* Real contact details */}
            <div className="space-y-2 mb-6 text-label-sm text-white/70">
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '16px' }} aria-hidden="true">call</span>
                <a href="tel:+919500829167" className="hover:underline hover:text-white transition-colors">+91 95008 29167</a>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '16px' }} aria-hidden="true">mail</span>
                <a href="mailto:carenhsalem@gmail.com" className="hover:underline hover:text-white transition-colors">carenhsalem@gmail.com</a>
              </p>
              <p className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '16px' }} aria-hidden="true">verified</span>
                <span>FSSAI Lic: <span className="font-mono">22426188000206</span></span>
              </p>
            </div>

            {/* Certifications row */}
            <div className="flex flex-wrap gap-2">
              {['FSSAI Certified', 'Fair Trade', 'MSC Sustainable'].map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1 bg-white/10 rounded-full text-label-sm text-white/70 border border-white/15"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Link groups (Quick Links, Categories, Support) */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="flex flex-col items-start lg:pt-3">
              <h3 className="text-label-md font-bold text-white mb-4.5 tracking-wider uppercase text-opacity-95">{group}</h3>
              <ul className="space-y-2.5 text-left w-full">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-label-md text-white/60 hover:text-white transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-label-sm text-white/40">
            © {new Date().getFullYear()} NH Salem Sea Foods. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/help" className="text-label-sm text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/help" className="text-label-sm text-white/40 hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
          </div>
          {/* Social */}
          <div className="flex items-center gap-3">
            {['instagram', 'facebook', 'twitter'].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={`Follow us on ${social}`}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-white/70" style={{ fontSize: '18px' }} aria-hidden="true">
                  {social === 'instagram' ? 'photo_camera' : social === 'facebook' ? 'thumb_up' : 'forum'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
