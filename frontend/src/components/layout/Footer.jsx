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
    { label: 'Dried Fish', to: '/category/dried-fish' },
    { label: 'Combos', to: '/category/combos' },
  ],
  'Support': [
    { label: 'Help Center', to: '/help' },
    { label: 'Track Order', to: '/track-order' },
    { label: 'Subscriptions', to: '/subscriptions' },
    { label: 'Contact Us', to: '/help' },
  ],
}

/**
 * Footer — Deep Navy background (#000516)
 */
export default function Footer() {
  return (
    <footer className="bg-[#000516] text-white mt-auto border-t border-white/10" aria-label="Site footer">
      <div className="container-max pt-16 pb-8">
        {/* Top grid - 2 columns mobile, 5 columns desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 items-start">
          {/* Brand block (taking up 2 columns on mobile, 2/5ths on desktop) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start pt-2 lg:pt-3">
            {/* Logo */}
            <div className="inline-flex items-center gap-3.5 mb-5 select-none">
              <img
                src="/crest.png"
                alt="NH Salem Sea Foods Logo"
                className="w-12 h-12 object-contain"
              />
              <div className="text-left pl-3 border-l border-white/20">
                <p className="font-serif text-headline-sm font-extrabold text-white leading-tight tracking-tight">NH Salem</p>
                <p className="text-[10px] font-bold text-[#fed255] tracking-[0.22em] uppercase leading-none mt-0.5">Sea Foods</p>
              </div>
            </div>

            <p className="text-body-md text-white/70 leading-relaxed mb-6 max-w-sm">
              Premium seafood sourced fresh from ocean waters, hygienically processed and cold-chain delivered to your door.
            </p>

            {/* Contact details with aligned icon baseline */}
            <div className="space-y-3.5 mb-6 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#fed255] text-lg shrink-0" aria-hidden="true">call</span>
                <a href="tel:+919500829167" className="hover:underline hover:text-white transition-colors">+91 9500829167</a>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#fed255] text-lg shrink-0" aria-hidden="true">mail</span>
                <a href="mailto:carenhsalem@gmail.com" className="hover:underline hover:text-white transition-colors">carenhsalem@gmail.com</a>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#fed255] text-lg shrink-0 mt-0.5" aria-hidden="true">location_on</span>
                <div className="leading-snug">
                  <span className="text-white font-semibold block mb-0.5">Registered Office:</span>
                  No: 4/174/F, Cheran Nagar/Kavery Nagar, Kondappanaickenpatti, Salem – 636008, Tamil Nadu
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#fed255] text-lg shrink-0 mt-0.5" aria-hidden="true">factory</span>
                <div className="leading-snug">
                  <span className="text-white font-semibold block mb-0.5">Processed & Packed by:</span>
                  Mahiban Foods and Sea Foods, No:11/514, Sahaya Matha Pattanam, 2nd Street, Thoothukudi – 628002
                </div>
              </div>
            </div>

            {/* Single Consolidated FSSAI Badge */}
            <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 mt-2">
              <span className="material-symbols-outlined text-[#16a34a] text-2xl">verified</span>
              <div>
                <p className="text-[10px] font-bold text-[#fed255] uppercase tracking-wider leading-none mb-1">FSSAI Registered</p>
                <p className="text-sm font-bold text-white leading-none">License No. 22426188000206</p>
              </div>
            </div>
          </div>

          {/* Link groups (Quick Links, Categories, Support) */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="col-span-1 lg:col-span-1 flex flex-col items-start lg:pt-3">
              <h3 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">{group}</h3>
              <ul className="space-y-3 text-left w-full">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/70 hover:text-[#fed255] transition-colors block"
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
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} NH Salem Sea Foods. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/help" className="text-xs text-white/50 hover:text-white/80 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/help" className="text-xs text-white/50 hover:text-white/80 transition-colors">
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
                className="w-9 h-9 bg-white/5 hover:bg-[#fed255]/20 text-white/70 hover:text-[#fed255] rounded-full flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">
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
