import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-lg">
        {/* Animated crest */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-32 h-32 flex items-center justify-center mx-auto mb-8 p-3"
        >
          <img
            src="/crest.png"
            alt="NH Salem Sea Foods Crest"
            className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-8xl font-black text-surface-container-highest mb-4">404</p>
          <h1 className="text-display-lg-mobile text-on-surface mb-3">Off the Map</h1>
          <p className="text-body-lg text-on-surface-variant mb-8">
            Looks like this page sailed away. Maybe it was swept out to sea — or you've caught a broken link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" size="lg">Back to Shore</Button>
            </Link>
            <Link to="/category/fish">
              <Button variant="secondary" size="lg">Browse Seafood</Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-wrap gap-3 justify-center"
        >
          {[
            { label: 'Home', to: '/' },
            { label: 'Track Order', to: '/orders/NHS-77421' },
            { label: 'Help Center', to: '/help' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-label-md text-primary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
