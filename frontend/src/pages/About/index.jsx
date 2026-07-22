import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import useInView, { useCountUp } from '@/hooks/useInView'

const WHY_CHOOSE_US = [
  { icon: 'phishing', title: 'Premium Fresh Catch', desc: 'Sourced from clean & rich ocean waters' },
  { icon: 'ac_unit', title: 'Blast Frozen', desc: 'Quick freezing locks in freshness & nutrients' },
  { icon: 'inventory_2', title: 'Cold Chain Maintained', desc: 'Proper storage & transport ensures premium quality' },
  { icon: 'sanitizer', title: 'Hygienically Packed', desc: 'Packed under strict hygiene standards for your safety' },
  { icon: 'storefront', title: 'Retail Supply', desc: 'Perfect for homes, retailers, restaurants & businesses' },
  { icon: 'verified', title: 'Quality Checked', desc: 'Every product goes through multiple quality checks' },
]

const COMMITMENT = [
  { title: 'Freshness', desc: 'We ensure the freshest seafood for you & your family.' },
  { title: 'Quality', desc: 'Only the best seafood that meets international quality standards.' },
  { title: 'Hygiene', desc: 'Maintaining high hygiene at every step of handling.' },
  { title: 'Customer Satisfaction', desc: 'Your trust and satisfaction are our top priorities.' },
]

const CERTIFICATIONS = [
  { name: 'FSSAI Registered', number: 'License No. 22426188000206', icon: 'verified' },
]

export default function About() {
  const [statsRef, statsInView] = useInView({ once: true })
  const cities = useCountUp(8, 2000, statsInView)
  const orders = useCountUp(50000, 2200, statsInView)
  const partners = useCountUp(120, 1800, statsInView)

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative py-24 bg-primary overflow-hidden" aria-labelledby="about-heading">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-on-tertiary-container rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container-max relative text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">About Us</p>
            <h1 id="about-heading" className="text-display-lg-mobile md:text-display-lg text-white mb-6">
              NH Salem Sea Foods
            </h1>
            <p className="text-body-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
              NH Salem Sea Foods is committed to delivering premium quality frozen seafood that preserves natural freshness, authentic taste, and nutritional value. Every product is carefully selected from trusted sources, hygienically processed, and maintained under strict cold-chain conditions from the ocean to your table. We proudly serve homes, restaurants, hotels, caterers, and retailers with reliable seafood products and customer-focused service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Commitment */}
      <section
        ref={statsRef}
        className="py-16 bg-secondary-container"
        aria-label="Our Commitment"
      >
        <div className="container-max grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {COMMITMENT.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <h3 className="text-2xl font-black text-on-secondary-container mb-2">{item.title}</h3>
              <p className="text-body-md text-on-secondary-container/80">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-background" aria-labelledby="why-choose-us-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="why-choose-us-heading" className="text-display-lg-mobile text-on-surface">Why Choose Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_CHOOSE_US.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="flex flex-col items-center text-center p-6 bg-surface-container-low rounded-[24px] shadow-sm"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-card">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '28px' }} aria-hidden="true">
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-headline-sm text-on-surface mb-2">{step.title}</h3>
                <p className="text-body-md text-on-surface-variant">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery/Process Highlight Strip */}
      <section className="py-12 bg-primary/10" aria-label="Highlight Strip">
        <div className="container-max text-center">
          <h2 className="text-headline-md text-primary font-bold mb-4">Fresh From The Ocean, Frozen For Freshness</h2>
          <div className="flex flex-wrap justify-center gap-4 text-on-surface font-medium">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>ac_unit</span> Stored at -18°C</span>
            <span className="hidden sm:block text-primary/30">•</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>star</span> Premium Frozen</span>
            <span className="hidden sm:block text-primary/30">•</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>health_and_safety</span> Hygienic & Safe</span>
            <span className="hidden sm:block text-primary/30">•</span>
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>inventory_2</span> Cold Chain Maintained</span>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-background" aria-labelledby="certifications-heading">
        <div className="container-max">
          <div className="text-center mb-10">
            <h2 id="certifications-heading" className="text-headline-md text-on-surface">Certified Maritime Authority</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                onClick={cert.name.includes('FSSAI') ? () => alert(`FSSAI License Number: 22426188000206`) : undefined}
              >
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-success filled" style={{ fontSize: '24px' }} aria-hidden="true">
                    {cert.icon}
                  </span>
                </div>
                <div>
                  <p className="text-label-lg font-bold text-on-surface mb-1">{cert.name}</p>
                  <p className="text-label-md text-on-surface-variant font-mono font-bold bg-surface-container-low px-2 py-1 rounded inline-block">{cert.number}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center" aria-label="Call to action">
        <div className="container-max">
          <h2 className="text-display-lg-mobile font-bold mb-4">Taste the Ocean — Shop Now</h2>
          <p className="text-body-lg text-white/70 mb-8 max-w-lg mx-auto">
            Experience the finest seafood delivered straight to your door.
          </p>
          <Link to="/">
            <Button variant="gold" size="lg">Explore Today's Catch</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
