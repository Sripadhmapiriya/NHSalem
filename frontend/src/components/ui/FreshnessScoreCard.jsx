import { motion } from 'framer-motion'
import ProgressRing from './ProgressRing'

/**
 * FreshnessScoreCard — Level 2 elevation
 * Deep Navy background, gold circular progress ring, aggressive shadow
 */
export default function FreshnessScoreCard({
  score = 94,
  catchTime = '4h ago',
  batchFreshness = 'Excellent',
  label = 'Freshness Score',
  metrics = [],
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`bg-primary-container rounded-[28px] shadow-stat p-6 text-white ${className}`}
    >
      <div className="flex items-center gap-6">
        {/* Ring */}
        <ProgressRing
          value={score}
          max={100}
          size={110}
          strokeWidth={9}
          color="#fed255"
          trackColor="rgba(255,255,255,0.12)"
          label={`${score}`}
          sublabel="/100"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-label-sm text-white/60 uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-headline-sm font-bold text-white mb-3">
            {batchFreshness}
          </h3>

          <div className="space-y-2">
            <FreshnessRow icon="schedule" label="Catch Time" value={catchTime} />
            {metrics.map((m) => (
              <FreshnessRow key={m.label} icon={m.icon || 'verified'} label={m.label} value={m.value} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FreshnessRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-secondary-container"
          style={{ fontSize: '16px' }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="text-label-sm text-white/70">{label}</span>
      </div>
      <span className="text-label-sm font-semibold text-white">{value}</span>
    </div>
  )
}
