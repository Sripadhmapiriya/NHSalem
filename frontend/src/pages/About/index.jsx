import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import useInView, { useCountUp } from '@/hooks/useInView'

const TEAM = [
  {
    name: 'Salem Rahman',
    role: 'Co-Founder & CEO',
    bio: 'A third-generation fisherman who grew up on the Tamil Nadu coast. Salem founded NH Salem Sea Foods with a singular mission: to bring the freshest coastal catches to urban dinner tables, with no compromise on sustainability or quality.',
    avatar: 'https://i.pravatar.cc/200?img=70',
  },
  {
    name: 'Ananya Nair',
    role: 'Chief Sourcing Officer',
    bio: 'Marine biologist turned supply chain expert. Ananya oversees all 120+ coastal fishing partnerships and quality certifications, ensuring every fish that leaves a dock meets NH Salem\'s Maritime Grade standards.',
    avatar: 'https://i.pravatar.cc/200?img=47',
  },
  {
    name: 'Dr. K. Venkatesh',
    role: 'Head of Food Safety & Logistics',
    bio: 'PhD in Food Science from IIT Madras. Dr. Venkatesh designed the proprietary cold-chain protocol that maintains 0–4°C from boat to doorstep — the backbone of the Freshness Score system.',
    avatar: 'https://i.pravatar.cc/200?img=59',
  },
]

const PROCESS_STEPS = [
  { icon: 'anchor', title: 'Sourced at the Coast', desc: 'Our network of 120+ fishing partners haul in the catch at dawn. We have first pick — before wholesale markets open.' },
  { icon: 'ac_unit', title: 'Iced & Inspected', desc: 'Within 30 minutes of landing, each batch is packed with food-grade ice and inspected by our quality team for size, texture, and aroma.' },
  { icon: 'inventory_2', title: 'Cold-Chain Packed', desc: 'Cleaned to order, vacuum-packed in biodegradable bags, and loaded into our refrigerated vehicles at 2–4°C.' },
  { icon: 'home', title: 'Delivered Fresh', desc: 'Our delivery partners complete the last mile in insulated thermacol boxes. Average coast-to-door time: 18 hours.' },
]

const CERTIFICATIONS = [
  { name: 'FSSAI Certified', number: 'Lic. No. 22426188000206', icon: 'verified' },
  { name: 'Fair Trade Certified', number: 'FT-2024-IN-0892', icon: 'handshake' },
  { name: 'MSC Sustainable', number: 'MSC-C-56781', icon: 'eco' },
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
            <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">Our Story</p>
            <h1 id="about-heading" className="text-display-lg-mobile md:text-display-lg text-white mb-6">
              Our Maritime Legacy
            </h1>
            <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
              NH Salem Sea Foods was born on the Tamil Nadu coast in 2019, with a simple conviction: that India's freshest seafood deserved a better path to the plate — one that honoured the fishermen who caught it, the fish that gave it, and the families who ate it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Band */}
      <section
        ref={statsRef}
        className="py-16 bg-secondary-container"
        aria-label="NH Salem by the numbers"
      >
        <div className="container-max grid grid-cols-3 gap-8 text-center">
          {[
            { value: `${cities}+`, label: 'Cities Served' },
            { value: `${orders.toLocaleString()}+`, label: 'Daily Orders' },
            { value: `${partners}+`, label: 'Fishing Partners' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-black text-on-secondary-container mb-1">{stat.value}</p>
              <p className="text-label-md text-on-secondary-container/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 bg-background" aria-labelledby="process-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">How It Works</p>
            <h2 id="process-heading" className="text-display-lg-mobile text-on-surface">Our Process</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-card">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '28px' }} aria-hidden="true">
                    {step.icon}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant font-semibold tracking-widest uppercase mb-1">
                  Step {i + 1}
                </p>
                <h3 className="text-headline-sm text-on-surface mb-2">{step.title}</h3>
                <p className="text-body-md text-on-surface-variant">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Visionaries */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="team-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <p className="text-label-md text-secondary font-semibold tracking-widest uppercase mb-2">The Team</p>
            <h2 id="team-heading" className="text-display-lg-mobile text-on-surface">The Visionaries</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-[28px] shadow-card p-6 text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-surface-container-high"
                />
                <h3 className="text-headline-sm text-on-surface mb-0.5">{member.name}</h3>
                <p className="text-label-md text-secondary font-semibold mb-3">{member.role}</p>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
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
                className={`flex items-center gap-4 bg-white rounded-[20px] shadow-card px-6 py-4 min-w-[220px] ${
                  cert.name.includes('FSSAI') ? 'cursor-pointer hover:border-primary/30 border border-transparent transition-all' : ''
                }`}
                title={cert.name.includes('FSSAI') ? 'Click to view FSSAI License Number' : undefined}
                onClick={cert.name.includes('FSSAI') ? () => alert(`FSSAI License Number: 22426188000206`) : undefined}
              >
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-success filled" style={{ fontSize: '24px' }} aria-hidden="true">
                    {cert.icon}
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-bold text-on-surface">{cert.name}</p>
                  <p className="text-label-sm text-on-surface-variant font-mono">{cert.number}</p>
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
            Join 50,000+ households who trust NH Salem for their daily seafood needs.
          </p>
          <Link to="/">
            <Button variant="gold" size="lg">Explore Today's Catch</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
