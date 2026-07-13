import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import FreshnessScoreCard from '@/components/ui/FreshnessScoreCard'
import Modal from '@/components/ui/Modal'

const LOGISTICS_STEPS = [
  { icon: 'anchor', title: 'Sourcing', desc: 'Selected by our team at partner fishing docks at 4–6 AM, before wholesale markets open.' },
  { icon: 'verified', title: 'Inspection', desc: 'Every batch is smell-tested, weigh-graded, and visually inspected by our QC team on-site.' },
  { icon: 'cleaning_services', title: 'Cleaning', desc: 'Cleaned to order by trained processing staff — descaled, gutted, or cut per your specification.' },
  { icon: 'ac_unit', title: 'Cold-Chain', desc: 'Vacuum-sealed in food-grade packaging at 2°C, loaded into refrigerated vehicles.' },
  { icon: 'home', title: 'Doorstep', desc: 'Delivered in insulated thermacol boxes within your chosen time slot — coast to kitchen in under 24 hours.' },
]

const FRESHNESS_EXPLAINERS = [
  { icon: 'schedule', title: 'Catch Time Delta', desc: 'Measures the time elapsed from catch to your doorstep. Under 24 hours scores 90+. Under 12 hours = 96+.', score: 94 },
  { icon: 'scale', title: 'Weight & Cut Integrity', desc: 'Checks that the product weight matches the stated weight (±5% tolerance) and that cuts are clean and consistent.', score: 98 },
  { icon: 'water', title: 'Current Batch Freshness', desc: 'A composite score from our QC team\'s sensory checks (colour, odour, texture firmness) on your specific batch.', score: 91 },
]

const CERTIFICATIONS = [
  {
    name: 'FSSAI Certified',
    number: 'Lic. No. 22426188000206',
    icon: 'verified',
    description: "India's premier food safety certification, ensuring all products meet national safety standards for human consumption.",
    issuer: 'Food Safety and Standards Authority of India',
  },
  {
    name: 'Fair Trade Certified',
    number: 'FT-2024-IN-0892',
    icon: 'handshake',
    description: 'Guarantees that our fishing partner communities receive fair wages and work in safe conditions.',
    issuer: 'Fair Trade India',
  },
  {
    name: 'MSC Sustainable',
    number: 'MSC-C-56781',
    icon: 'eco',
    description: 'Marine Stewardship Council certification confirming our seafood is sourced sustainably, with no overfishing.',
    issuer: 'Marine Stewardship Council',
  },
]

export default function Quality() {
  const [certModal, setCertModal] = useState(null)

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section
        className="relative py-24 bg-primary text-white overflow-hidden"
        aria-labelledby="quality-heading"
      >
        <div className="container-max relative z-10 text-center">
          <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">
            Our Commitment
          </p>
          <h1 id="quality-heading" className="text-display-lg-mobile md:text-display-lg text-white mb-6">
            From Coast to Kitchen<br />in Under 24 Hours
          </h1>
          <p className="text-body-lg text-white/70 max-w-2xl mx-auto">
            The NH Salem Freshness Promise isn't a marketing tagline — it's a measurable, transparent, auditable system built into every order we ship.
          </p>
        </div>
      </section>

      {/* Maritime Logistics Loop */}
      <section className="py-16 bg-background" aria-labelledby="logistics-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="logistics-heading" className="text-display-lg-mobile text-on-surface mb-3">The Maritime Logistics Loop</h2>
            <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
              5 meticulously managed stages, each with a defined SLA and QC checkpoint.
            </p>
          </div>

          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-outline-variant/30" aria-hidden="true" />

            <div className="grid sm:grid-cols-5 gap-6 relative">
              {LOGISTICS_STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-card relative z-10">
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '26px' }} aria-hidden="true">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="text-label-md font-bold text-on-surface mb-1">{step.title}</h3>
                  <p className="text-label-sm text-on-surface-variant">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Freshness Score Explained */}
      <section className="py-16 bg-surface-container-low" aria-labelledby="score-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="score-heading" className="text-display-lg-mobile text-on-surface mb-3">Freshness Score Explained</h2>
            <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Your Freshness Score is a composite of 3 independently measured dimensions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FRESHNESS_EXPLAINERS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-primary rounded-[28px] shadow-stat p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary-container/20 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '20px' }} aria-hidden="true">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-white">{item.title}</p>
                    <p className="text-label-sm text-secondary-container font-bold">{item.score}/100</p>
                  </div>
                </div>
                <p className="text-body-md text-white/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Live example */}
          <div className="mt-12 max-w-lg mx-auto">
            <h3 className="text-headline-sm text-on-surface text-center mb-4">Live Example</h3>
            <FreshnessScoreCard
              score={94}
              catchTime="4h ago"
              batchFreshness="Excellent"
              metrics={[
                { icon: 'scale', label: 'Weight Integrity', value: 'Verified' },
                { icon: 'water', label: 'Cold Chain', value: '2–4°C' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-background" aria-labelledby="cert-heading">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 id="cert-heading" className="text-display-lg-mobile text-on-surface mb-3">Certified Maritime Authority</h2>
            <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
              Click any certificate to view the full details. All certifications are current and publicly verifiable.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.button
                key={cert.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                onClick={() => setCertModal(cert)}
                className="flex flex-col items-center gap-3 bg-white rounded-[28px] shadow-card p-6 text-center hover:shadow-stat transition-shadow group"
                aria-label={`View ${cert.name} certificate`}
              >
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center group-hover:bg-success/20 transition-colors">
                  <span className="material-symbols-outlined text-success filled" style={{ fontSize: '32px' }} aria-hidden="true">{cert.icon}</span>
                </div>
                <h3 className="text-label-md font-bold text-on-surface">{cert.name}</h3>
                <p className="text-label-sm text-on-surface-variant font-mono">{cert.number}</p>
                <span className="text-label-sm text-primary font-semibold flex items-center gap-1">
                  View Certificate
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">open_in_new</span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container-max">
          <h2 className="text-display-lg-mobile font-bold mb-4">Taste the Maritime Difference Today</h2>
          <p className="text-body-lg text-white/70 mb-8 max-w-lg mx-auto">
            Every order is backed by our Freshness Score and 2-hour quality guarantee.
          </p>
          <Link to="/category/fish">
            <Button variant="gold" size="lg">Shop Today's Catch</Button>
          </Link>
        </div>
      </section>

      {/* Certificate Modal */}
      <Modal
        isOpen={!!certModal}
        onClose={() => setCertModal(null)}
        title={certModal?.name}
        id="cert-modal"
        size="md"
      >
        {certModal && (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-success filled" style={{ fontSize: '40px' }} aria-hidden="true">
                {certModal.icon}
              </span>
            </div>
            <div className="text-center">
              <p className="text-label-md text-on-surface-variant font-mono">{certModal.number}</p>
              <p className="text-label-sm text-on-surface-variant">Issued by {certModal.issuer}</p>
            </div>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">{certModal.description}</p>
            <div className="bg-success/5 border border-success/20 rounded-[16px] p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-success filled" style={{ fontSize: '20px' }} aria-hidden="true">verified</span>
              <p className="text-label-md text-success font-semibold">Current & Actively Certified</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
