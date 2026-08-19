import { Link, useNavigate } from 'react-router-dom'
import Accordion from '@/components/ui/Accordion'

const FAQS = [
  {
    id: 'faq-1',
    title: 'How is the seafood packed/frozen?',
    content: 'Our seafood is flash-frozen at -18°C and undergoes an IQF (Individually Quick Frozen) process. It is cleaned with brine to preserve its natural freshness, texture, and nutritional value without any added preservatives.',
  },
  {
    id: 'faq-2',
    title: 'What is the delivery radius/area?',
    content: 'We currently offer fresh, doorstep delivery within an 8km radius from our Salem store.',
  },
  {
    id: 'faq-3',
    title: 'How do I track my order?',
    content: (
      <span>
        You can track the live status of your delivery at any time using our <Link to="/track-order" className="text-primary hover:underline font-bold">Track Order</Link> page.
      </span>
    ),
  },
  {
    id: 'faq-4',
    title: 'What if I want to cancel/return an order?',
    content: 'Because we deal in fresh, perishable goods, cancellations are only accepted before the order leaves our facility. If there is an issue with the quality of your order upon delivery, please contact our support team immediately for a replacement or refund.',
  },
  {
    id: 'faq-5',
    title: 'How do prices work?',
    content: 'Seafood prices naturally fluctuate based on daily market rates, the catch size, and seasonal availability. Our prices are updated dynamically so you always pay the fair, current market price.',
  },
  {
    id: 'faq-6',
    title: 'Payment methods accepted',
    content: 'We accept all major Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for eligible orders.',
  },
]

export default function HelpCenter() {
  const navigate = useNavigate()

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-[#000516]" aria-labelledby="help-heading">
        <div className="container-max text-center">
          <p className="text-[#fed255] font-bold tracking-widest uppercase text-sm mb-3">Support</p>
          <h1 id="help-heading" className="text-display-lg-mobile md:text-display-lg text-white mb-4 font-extrabold">
            Help Center & FAQ
          </h1>
          <p className="text-body-lg text-slate-300 max-w-xl mx-auto">
            Find answers to common questions or reach out to our team directly.
          </p>
        </div>
      </section>

      <div className="container-max py-12 md:py-20">
        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-extrabold text-[#000516] mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion items={FAQS} allowMultiple={false} defaultOpen="faq-1" />
          </div>

          {/* Sidebar — Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] shadow-xl border border-slate-100 p-8">
              <h2 className="text-2xl font-extrabold text-[#000516] mb-6">Still need help?</h2>
              
              <div className="space-y-4">
                <a
                  href="tel:+919500829167"
                  className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[20px] hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <span className="material-symbols-outlined text-green-700" style={{ fontSize: '24px' }} aria-hidden="true">call</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                    <p className="text-slate-800 font-bold group-hover:text-green-700 transition-colors">+91 95008 29167</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/919500829167?text=Hi,%20I%20need%20help%20with%20my%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[20px] hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#25D366]" style={{ fontSize: '24px' }} aria-hidden="true">chat</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="text-slate-800 font-bold group-hover:text-[#25D366] transition-colors">Chat with us</p>
                  </div>
                </a>

                <a
                  href="mailto:carenhsalem@gmail.com"
                  className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-[20px] hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                    <span className="material-symbols-outlined text-blue-700" style={{ fontSize: '24px' }} aria-hidden="true">mail</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-slate-800 font-bold group-hover:text-blue-700 transition-colors">carenhsalem@gmail.com</p>
                  </div>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => {
                    navigate('/')
                    setTimeout(() => {
                      const el = document.getElementById('contact')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }, 250) // Wait for Home to lazy load
                  }}
                  className="w-full bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">edit_document</span>
                  Contact Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
