import { motion } from 'framer-motion'
import Card from './Card'

/**
 * StatCard - displays numeric statistics or indicators with premium typography
 */
export default function StatCard({
  label,
  value,
  description,
  icon,
  trend,
  className = '',
  ...props
}) {
  return (
    <Card
      className={`p-6 flex items-start gap-4 hover:shadow-stat border border-outline-variant/30 transition-all ${className}`}
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }} aria-hidden="true">
            {icon}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-label-md text-on-surface-variant font-semibold uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-display-lg-mobile text-on-surface font-black leading-none">
            {value}
          </p>
          {trend && (
            <span
              className={`text-label-sm font-semibold flex items-center ${
                trend.value.startsWith('+') ? 'text-success' : 'text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                {trend.value.startsWith('+') ? 'trending_up' : 'trending_down'}
              </span>
              {trend.value}
            </span>
          )}
        </div>
        {description && (
          <p className="text-body-sm text-outline mt-1.5 leading-normal">
            {description}
          </p>
        )}
      </div>
    </Card>
  )
}
