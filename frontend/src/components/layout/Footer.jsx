import { Link, useNavigate, useLocation } from 'react-router-dom'

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/#about' },

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
    { label: 'Contact Us', to: '/#contact' },
    { label: 'FAQ & Help', to: '/help' },
  ],
}

/**
 * Compact Enterprise Footer — Deep Navy background (#000516)
 */
export default function Footer() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLinkClick = (e, to) => {
    if (to.startsWith('/#')) {
      e.preventDefault()
      const sectionId = to.split('#')[1]
      if (location.pathname === '/') {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(sectionId)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      }
    } else if (to === '/') {
      if (location.pathname === '/') {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <footer className="w-full bg-[#000516] text-white border-t border-white/10 shrink-0 pt-10 pb-5" aria-label="Site footer">
      <div className="container-max">
        {/* Top grid - 2 columns mobile, 5 columns desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 pb-6 border-b border-white/10 items-start">
          {/* Brand block (taking up 2 columns on mobile, 2/5ths on desktop) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-2 select-none">
              <img
                src="/crest.png"
                alt="NH Salem Sea Foods Logo"
                className="w-9 h-9 object-contain"
              />
              <div className="text-left pl-2.5 border-l border-white/20">
                <p className="font-serif text-base font-extrabold text-white leading-tight tracking-tight">NH Salem</p>
                <p className="text-[9px] font-bold text-[#fed255] tracking-[0.2em] uppercase leading-none mt-0.5">Sea Foods</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3.5 max-w-sm">
              Premium seafood sourced fresh from ocean waters, hygienically processed and cold-chain delivered to your door.
            </p>

            {/* Contact Details Block */}
            <div className="space-y-2 text-xs text-slate-200 mb-4 w-full max-w-md">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#fed255] text-sm shrink-0 select-none leading-none pt-0.5" aria-hidden="true">call</span>
                <a href="tel:+919500829167" className="text-[#fed255] underline hover:text-white transition-colors font-semibold text-xs leading-normal flex-1">+91 9500829167</a>
              </div>

              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#fed255] text-sm shrink-0 select-none leading-none pt-0.5" aria-hidden="true">mail</span>
                <a href="mailto:carenhsalem@gmail.com" className="text-[#fed255] underline hover:text-white transition-colors font-semibold text-xs leading-normal flex-1">carenhsalem@gmail.com</a>
              </div>

              <a
                href="https://maps.app.goo.gl/whSWam4pfC6ecYC39?g_st=iw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 group"
              >
                <span className="material-symbols-outlined text-[#fed255] text-sm shrink-0 select-none leading-none pt-0.5" aria-hidden="true">location_on</span>
                <div className="leading-normal text-xs text-slate-200 flex-1 group-hover:text-[#fed255] group-hover:underline transition-colors">
                  <span className="text-white font-semibold group-hover:text-[#fed255]">Registered Office:</span> No: 4/174/F, Cheran Nagar, Kondappanaickenpatti, Salem – 636008
                </div>
              </a>

              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#fed255] text-sm shrink-0 select-none leading-none pt-0.5" aria-hidden="true">storefront</span>
                <div className="leading-normal text-xs text-slate-200 flex-1">
                  <span className="text-white font-semibold">Marketed & Distributed by:</span> NH Salem and Snacks
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#fed255] text-sm shrink-0 select-none leading-none pt-0.5" aria-hidden="true">factory</span>
                <div className="leading-normal text-xs text-slate-200 flex-1">
                  <span className="text-white font-semibold">Processed & Packed by:</span> Mahiban Foods, No:11/514, Sahaya Matha Pattanam, Thoothukudi – 628002
                </div>
              </div>
            </div>

            {/* Compact FSSAI + GST Badges */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[#16a34a] text-xl shrink-0">verified</span>
                <div className="flex flex-col justify-center text-left">
                  <p className="text-[9px] font-bold text-[#fed255] uppercase tracking-wider leading-none mb-0.5">FSSAI Registered</p>
                  <p className="text-xs font-bold text-white leading-none">License No. 22426188000206</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[#16a34a] text-xl shrink-0">receipt_long</span>
                <div className="flex flex-col justify-center text-left">
                  <p className="text-[9px] font-bold text-[#fed255] uppercase tracking-wider leading-none mb-0.5">GST Registered</p>
                  <p className="text-xs font-bold text-white leading-none">GST No. 33CKVPN4299M1Z3</p>
                </div>
              </div>
            </div>
          </div>

          {/* Link groups (Quick Links, Categories, Support) */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="col-span-1 lg:col-span-1 flex flex-col items-start">
              <h3 className="text-xs font-bold text-white mb-2.5 tracking-wider uppercase">{group}</h3>
              <ul className="space-y-1 text-left w-full">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={(e) => handleLinkClick(e, link.to)}
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

        {/* 3-Part Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
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
              { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/nh_salem_official?igsh=OWgxbWczdGpqcWIz&igsi=OWgxbWczdGpqcWIz&utm_source=qr' },
              { id: 'location', icon: 'location_on', label: 'Location on Google Maps', href: 'https://maps.app.goo.gl/whSWam4pfC6ecYC39?g_st=iw' },
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
                {social.id === 'instagram' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
                    <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
                  </svg>
                ) : social.id === 'whatsapp' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.26-8.25a8.2 8.2 0 0 1 5.84 2.42 8.19 8.19 0 0 1 2.42 5.84c0 4.55-3.71 8.23-8.27 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.3c-.23.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.17 1.71 2.6 4.14 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.28Z" />
                  </svg>
                ) : (
                  <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center pt-[1px]" aria-hidden="true">
                    {social.icon}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}