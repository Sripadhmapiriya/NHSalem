import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function StoreLocator() {
  const storeAddress = "4/174/F, Cheran Nagar / Kavery Nagar, Kondappanaickenpatti, Salem – 636008, Tamil Nadu"
  const mapQuery = "NH Salem Sea Foods, 4/174/F, Cheran Nagar, Kondappanaickenpatti, Salem"
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeAddress)}`

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="container-max">
        <div className="text-center mb-12">
          <p className="text-[#fed255] font-bold tracking-widest uppercase text-sm mb-2">Our Location</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#000516] mb-4">Visit Our Store</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Drop by our Salem store to experience the freshest seafood in town.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Store Details Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[28px] p-8 lg:p-10 shadow-xl border border-slate-100 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-extrabold text-[#000516] mb-8">NH Salem Sea Foods</h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600">location_on</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Address</h3>
                  <p className="text-slate-700 leading-relaxed font-medium">{storeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-green-600">call</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone</h3>
                  <a href="tel:+919500829167" className="text-slate-700 font-medium hover:text-[#000516] hover:underline transition-colors block">
                    +91 95008 29167
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600">mail</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</h3>
                  <a href="mailto:carenhsalem@gmail.com" className="text-slate-700 font-medium hover:text-[#000516] hover:underline transition-colors block">
                    carenhsalem@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-purple-600">schedule</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Hours</h3>
                  <div className="text-slate-700 font-medium space-y-0.5">
                    <p>Monday – Friday: 10:00 AM – 6:00 PM</p>
                    <p>Saturday – Sunday: 6:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-teal-600">moped</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Delivery</h3>
                  <p className="text-teal-800 font-bold bg-teal-50 inline-block px-3.5 py-1.5 rounded-xl border border-teal-100 text-sm">
                    We deliver within an 8km radius from this location
                  </p>
                </div>
              </div>
            </div>

            <a href={directionsUrl} target="_blank" rel="noreferrer" className="block w-full">
              <button 
                type="button" 
                className="w-full bg-[#000516] hover:bg-[#0b1e3d] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">directions</span>
                Get Directions
              </button>
            </a>
          </motion.div>

          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-[28px] overflow-hidden shadow-xl border border-slate-100 min-h-[400px] md:min-h-full h-full w-full"
          >
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="100%" 
              style={{ border: 0, minHeight: '400px', height: '100%' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="NH Salem Sea Foods Location Map"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
