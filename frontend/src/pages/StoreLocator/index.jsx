import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import useToastStore from '@/store/toastStore'
import { getCities, registerCityNotification } from '@/services/api'
import useDebounce from '@/hooks/useDebounce'

const notifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function StoreLocator() {
  const [cities, setCities] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [notifyCity, setNotifyCity] = useState('')
  const { addToast } = useToastStore()
  const debouncedSearch = useDebounce(search, 250)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(notifySchema),
  })

  useEffect(() => {
    getCities().then(setCities)
  }, [])

  const liveCities = useMemo(() => cities.filter((c) => c.status === 'live'), [cities])
  const comingSoonCities = useMemo(() => cities.filter((c) => c.status === 'coming_soon'), [cities])



  const filteredLive = useMemo(() => {
    if (!debouncedSearch) return liveCities
    const q = debouncedSearch.toLowerCase()
    return liveCities.filter((c) => c.name.toLowerCase().includes(q) || c.pincode?.includes(q))
  }, [liveCities, debouncedSearch])

  const onNotifySubmit = async ({ email }) => {
    if (!notifyCity) {
      addToast({ message: 'Please select a city first!', type: 'warning' })
      return
    }
    const city = comingSoonCities.find((c) => c.name === notifyCity)
    if (!city) return

    try {
      const res = await registerCityNotification(email, city.id)
      if (res.success) {
        addToast({ message: `We'll notify ${email} when we arrive in ${notifyCity}! 📍`, type: 'success' })
        reset()
        setNotifyCity('')
      }
    } catch (err) {
      addToast({ message: err.message || 'Failed to register notification interest.', type: 'error' })
    }
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-primary text-white text-center" aria-labelledby="stores-heading">
        <div className="container-max">
          <p className="text-label-md text-secondary-container font-semibold tracking-widest uppercase mb-3">
            Delivery Network
          </p>
          <h1 id="stores-heading" className="text-display-lg-mobile md:text-display-lg mb-4">
            Find Your Nearest Freshness Hub
          </h1>
          <p className="text-body-lg text-white/70 max-w-xl mx-auto">
            We currently serve 8 cities across South India, with rapid expansion underway.
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="container-max py-8">
        <div className="max-w-lg mx-auto relative mb-10">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: '20px' }} aria-hidden="true">search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city or pincode…"
            aria-label="Search cities"
            className="w-full rounded-lg border border-outline-variant bg-white pl-11 pr-5 py-3.5 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none shadow-card"
          />
        </div>

        {/* Live Cities Grid */}
        <div className="mb-12">
          <h2 className="text-headline-md text-on-surface mb-2">Currently Serviceable Cities</h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            {filteredLive.length} {filteredLive.length === 1 ? 'city' : 'cities'} live
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLive.map((city, i) => (
              <motion.button
                key={city.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                onClick={() => setSelectedCity(selectedCity?.id === city.id ? null : city)}
                aria-pressed={selectedCity?.id === city.id}
                className={`flex flex-col items-start p-5 bg-white rounded-[20px] shadow-card border-2 transition-all text-left ${
                  selectedCity?.id === city.id ? 'border-primary shadow-stat' : 'border-transparent hover:border-outline-variant'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontSize: '20px' }} aria-hidden="true">location_city</span>
                  </div>
                  <span className="text-label-sm text-success bg-success/10 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" aria-hidden="true" />
                    Live Now
                  </span>
                </div>
                <p className="text-headline-sm text-on-surface font-bold">{city.name}</p>
                <p className="text-label-sm text-on-surface-variant">{city.stores} store{city.stores !== 1 ? 's' : ''}</p>
              </motion.button>
            ))}

            {filteredLive.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-body-lg text-on-surface-variant">No cities found for "{search}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected city delivery slots */}
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary rounded-[28px] p-6 text-white mb-12"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-sm text-white">Delivery Slots in {selectedCity.name}</h3>
              <button onClick={() => setSelectedCity(null)} aria-label="Close" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '18px' }} aria-hidden="true">close</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCity.slots.map((slot) => (
                <span key={slot} className="px-3 py-1.5 bg-white/15 rounded-lg text-label-md font-semibold text-white border border-white/20">
                  {slot}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coming Soon */}
        <div className="bg-surface-container-low rounded-[28px] p-8">
          <h2 className="text-headline-md text-on-surface mb-2">Coming Soon to Your Neighborhood</h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            We're expanding rapidly. Get notified when NH Salem launches in your city.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {comingSoonCities.map((city) => (
              <button
                key={city.id}
                onClick={() => setNotifyCity(city.name)}
                className={`px-4 py-2 rounded-full border text-label-md font-semibold transition-all ${
                  notifyCity === city.name
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white text-on-surface border-outline-variant hover:border-primary'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          <form
            onSubmit={handleSubmit(onNotifySubmit)}
            className="flex flex-col sm:flex-row gap-3 max-w-md"
            noValidate
            aria-label="City notification signup"
          >
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email for city launch notification"
                aria-invalid={!!errors.email}
                required
                {...register('email')}
                className="w-full rounded-lg border border-outline-variant bg-white px-5 py-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none"
              />
              {errors.email && (
                <p role="alert" className="text-label-sm text-error mt-1 pl-2">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Notify Me
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
