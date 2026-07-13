import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import useToastStore from '@/store/toastStore'
import { submitBulkInquiry } from '@/services/api'

const INDUSTRIES = [
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel' },
  { id: 'cloud-kitchen', label: 'Cloud Kitchen', icon: 'lunch_dining' },
  { id: 'catering', label: 'Catering', icon: 'set_meal' },
  { id: 'other', label: 'Other', icon: 'business' },
]

const B2B_BENEFITS = [
  { icon: 'sell', title: 'Wholesale Pricing', desc: '15–30% below retail prices, with volume-linked discounts and weekly rate cards.' },
  { icon: 'person', title: 'Dedicated Account Manager', desc: 'Your single point of contact for orders, customisation, and supply planning.' },
  { icon: 'content_cut', title: 'Custom Cuts', desc: 'We cut, debone, and portion seafood exactly to your kitchen\'s specification.' },
  { icon: 'calendar_month', title: 'Scheduled Supply', desc: 'Pre-agreed weekly/daily delivery schedules with priority cold-chain service.' },
]

const bulkSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  industry: z.string().min(1, 'Please select your industry type'),
  specifications: z.string().optional(),
})

export default function BulkOrders() {
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const { addToast } = useToastStore()

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(bulkSchema),
  })

  const onSubmit = async (data) => {
    const result = await submitBulkInquiry(data)
    if (result.success) {
      setReferenceId(result.referenceId)
      setSubmitted(true)
      addToast({ message: 'Wholesale inquiry received! We\'ll contact you within 24 hours.', type: 'success', duration: 5000 })
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-primary text-white text-center" aria-labelledby="b2b-heading">
        <div className="container-max">
          <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">
            Wholesale Program
          </p>
          <h1 id="b2b-heading" className="text-display-lg-mobile md:text-display-lg mb-4">
            Supplying Excellence<br />Across Industries
          </h1>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto">
            NH Salem partners with restaurants, hotels, cloud kitchens, and catering companies across South India.
          </p>
        </div>
      </section>

      {/* Industries */}
      <section className="py-14 bg-background" aria-labelledby="industries-heading">
        <div className="container-max">
          <h2 id="industries-heading" className="text-headline-md text-on-surface text-center mb-8">Industries We Serve</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {INDUSTRIES.slice(0, 4).map((ind, i) => (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 w-36"
              >
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-card">
                  <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '32px' }} aria-hidden="true">{ind.icon}</span>
                </div>
                <p className="text-label-md font-semibold text-on-surface text-center">{ind.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-14 bg-surface-container-low" aria-labelledby="benefits-heading">
        <div className="container-max">
          <h2 id="benefits-heading" className="text-display-lg-mobile text-on-surface text-center mb-10">Why Partner With NH Salem?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {B2B_BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-[28px] shadow-card p-6"
              >
                <div className="w-12 h-12 bg-secondary-container/20 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: '24px' }} aria-hidden="true">{benefit.icon}</span>
                </div>
                <h3 className="text-headline-sm text-on-surface mb-2">{benefit.title}</h3>
                <p className="text-body-md text-on-surface-variant">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-16 bg-background" aria-labelledby="quote-heading">
        <div className="container-max max-w-2xl">
          <div className="text-center mb-10">
            <h2 id="quote-heading" className="text-display-lg-mobile text-on-surface mb-3">
              Request Your Exclusive Wholesale Quote
            </h2>
            <p className="text-body-lg text-on-surface-variant">
              Fill in the details below and our team will reach out, or contact us directly at <a href="tel:+919500829167" className="text-primary font-semibold hover:underline">+91 95008 29167</a> / <a href="mailto:carenhsalem@gmail.com" className="text-primary font-semibold hover:underline">carenhsalem@gmail.com</a>.
            </p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[28px] shadow-card p-10 text-center"
            >
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-success filled" style={{ fontSize: '40px' }} aria-hidden="true">check_circle</span>
              </div>
              <h3 className="text-headline-md text-on-surface mb-2">Inquiry Received!</h3>
              <p className="text-body-lg text-on-surface-variant mb-4">
                Your wholesale inquiry has been submitted. Our team will contact you within 24 business hours.
              </p>
              <p className="text-label-sm text-on-surface-variant font-mono mb-6">Reference: {referenceId}</p>
              <Button variant="primary" onClick={() => setSubmitted(false)}>Submit Another Inquiry</Button>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="bg-white rounded-[28px] shadow-card p-8 space-y-5"
              aria-label="Wholesale inquiry form"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Business Name"
                  id="business-name"
                  placeholder="e.g. Spice Garden Restaurant"
                  required
                  {...register('businessName')}
                  error={errors.businessName?.message}
                />
                <Input
                  label="Contact Name"
                  id="contact-name"
                  placeholder="Your full name"
                  required
                  {...register('contactName')}
                  error={errors.contactName?.message}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input
                  label="Email Address"
                  id="b2b-email"
                  type="email"
                  placeholder="business@example.com"
                  required
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="Phone Number"
                  id="b2b-phone"
                  type="tel"
                  placeholder="10-digit mobile"
                  required
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="b2b-industry" className="text-label-md text-on-surface-variant font-semibold">
                  Industry Type <span className="text-error">*</span>
                </label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="b2b-industry"
                      value={field.value}
                      onChange={field.onChange}
                      options={INDUSTRIES.map((ind) => ({ value: ind.id, label: ind.label }))}
                      placeholder="Select your industry"
                      error={errors.industry?.message}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="b2b-specs" className="text-label-md text-on-surface-variant font-semibold">
                  Additional Specifications
                </label>
                <textarea
                  id="b2b-specs"
                  placeholder="e.g. Need 10kg tiger prawns (16–20 count) and 5kg pomfret fillets, delivered Mon/Thu before 8 AM."
                  rows={4}
                  {...register('specifications')}
                  className="rounded-[16px] bg-surface-container-low border border-outline-variant px-5 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none resize-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
              >
                Submit Wholesale Inquiry
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
