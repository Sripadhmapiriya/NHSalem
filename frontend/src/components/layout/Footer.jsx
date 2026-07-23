import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Quality Promise', to: '/quality' },
    { label: 'Store Locator', to: '/stores' },
    { label: 'Wholesale / B2B', to: '/bulk-orders' },
    { label: 'Special Offers', to: '/category/combos' },
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
    { label: 'FAQ & Help', to: '/help' },
    { label: 'Sitemap', to: '/help' },
  ],
}

/**
 * Compact Enterprise Footer — Deep Navy background (#000516)
 */
export default function Footer() {
  return (
    <footer className="w-full bg-[#000516] text-white border-t border-white/10 shrink-0 pt-16 pb-8" aria-label="Site footer">
      <div className="container-max">
        {/* Top grid - 2 columns mobile, 5 columns desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-white/10 items-start">
          {/* Brand block (taking up 2 columns on mobile, 2/5ths on desktop) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-3 select-none">
              <img
                src="/crest.png"
                alt="NH Salem Sea Foods Logo"
                className="w-10 h-10 object-contain"
              />
              <div className="text-left pl-2.5 border-l border-white/20">
                <p className="font-serif text-lg font-extrabold text-white leading-tight tracking-tight">NH Salem</p>
                <p className="text-[9px] font-bold text-[#fed255] tracking-[0.2em] uppercase leading-none mt-0.5">Sea Foods</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5 max-w-sm">
              Premium seafood sourced fresh from ocean waters, hygienically processed and cold-chain delivered to your door.
            </p>

            {/* Contact Details Block - Modestly Expanded Breathing Room */}
            <div className="space-y-4 text-xs text-slate-200 mb-6 w-full max-w-md">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#fed255] text-base shrink-0 select-none leading-none pt-0.5" aria-hidden="true">call</span>
                <a href="tel:+919500829167" className="text-[#fed255] underline hover:text-white transition-colors font-semibold text-xs leading-normal flex-1">+91 9500829167</a>
              </div>
              
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#fed255] text-base shrink-0 select-none leading-none pt-0.5" aria-hidden="true">mail</span>
                <a href="mailto:carenhsalem@gmail.com" className="text-[#fed255] underline hover:text-white transition-colors font-semibold text-xs leading-normal flex-1">carenhsalem@gmail.com</a>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#fed255] text-base shrink-0 select-none leading-none pt-0.5" aria-hidden="true">location_on</span>
                <div className="leading-normal text-xs text-slate-200 flex-1">
                  <span className="text-white font-semibold">Registered Office:</span> No: 4/174/F, Cheran Nagar, Kondappanaickenpatti, Salem – 636008
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#fed255] text-base shrink-0 select-none leading-none pt-0.5" aria-hidden="true">factory</span>
                <div className="leading-normal text-xs text-slate-200 flex-1">
                  <span className="text-white font-semibold">Processed & Packed by:</span> Mahiban Foods, No:11/514, Sahaya Matha Pattanam, Thoothukudi – 628002
                </div>
              </div>
            </div>

            {/* Single Compact FSSAI Badge - Symmetrical Internal Padding */}
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="material-symbols-outlined text-[#16a34a] text-2xl shrink-0">verified</span>
              <div className="flex flex-col justify-center text-left">
                <p className="text-[10px] font-bold text-[#fed255] uppercase tracking-wider leading-none mb-1">FSSAI Registered</p>
                <p className="text-xs font-bold text-white leading-none">License No. 22426188000206</p>
              </div>
            </div>
          </div>

          {/* Link groups (Quick Links, Categories, Support) */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="col-span-1 lg:col-span-1 flex flex-col items-start">
              <h3 className="text-xs font-bold text-white mb-3.5 tracking-wider uppercase">{group}</h3>
              <ul className="space-y-2 text-left w-full">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-slate-200 hover:text-[#fed255] hover:underline transition-colors block py-0.5 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 3-Part Bottom Bar — Exact Midline Vertical Alignment */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          {/* 1. Copyright Text */}
          <div className="h-8 flex items-center">
            <p className="text-xs text-slate-300 font-medium leading-none">
              © {new Date().getFullYear()} NH Salem Sea Foods. All rights reserved.
            </p>
          </div>
          
          {/* 2. Privacy Policy & Terms Links */}
          <div className="h-8 flex items-center gap-5">
            <Link to="/help" className="text-xs text-slate-200 hover:text-[#fed255] transition-colors font-medium leading-none flex items-center">
              Privacy Policy
            </Link>
            <Link to="/help" className="text-xs text-slate-200 hover:text-[#fed255] transition-colors font-medium leading-none flex items-center">
              Terms of Service
            </Link>
          </div>

          {/* 3. Social Buttons */}
          <div className="h-8 flex items-center gap-2.5">
            {[
              { id: 'instagram', icon: 'photo_camera', label: 'Instagram', href: 'https://instagram.com' },
              { id: 'facebook', icon: 'thumb_up', label: 'Facebook', href: 'https://facebook.com' },
              { id: 'whatsapp', icon: 'chat', label: 'WhatsApp', href: 'https://wa.me/919500829167' },
            ].map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${social.label}`}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-[#fed255] hover:bg-[#fed255] hover:text-[#000516] flex items-center justify-center transition-all duration-200 shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center pt-[1px]" aria-hidden="true">
                  {social.icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
