import { motion } from 'framer-motion'

/**
 * Stepper — two variants:
 * 1. "quantity" — inline +/- stepper (used in cart/product)
 * 2. "progress" — horizontal step indicator (used in checkout)
 */
export function QuantityStepper({ value, onIncrease, onDecrease, min = 0, max = 99 }) {
  return (
    <div className="flex items-center bg-surface-container rounded-full overflow-hidden border border-outline-variant">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-30 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">
          remove
        </span>
      </motion.button>
      <span
        className="min-w-[40px] text-center text-body-md font-semibold text-on-surface"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container-high disabled:opacity-30 transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">
          add
        </span>
      </motion.button>
    </div>
  )
}

/**
 * ProgressStepper — checkout progress indicator
 * steps: [{ id, label, icon }]
 */
export function ProgressStepper({ steps, currentStep }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center justify-between w-full" role="list" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const completed = i < currentIndex
        const active = i === currentIndex

        return (
          <div
            key={step.id}
            className="flex items-center flex-1"
            role="listitem"
            aria-current={active ? 'step' : undefined}
          >
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <motion.div
                animate={{
                  backgroundColor: completed || active ? '#000516' : '#efedf0',
                  borderColor: completed || active ? '#000516' : '#c5c6cf',
                }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              >
                {completed ? (
                  <span className="material-symbols-outlined text-on-primary text-[18px]" aria-hidden="true">
                    check
                  </span>
                ) : (
                  <span
                    className={`material-symbols-outlined ${active ? 'text-on-primary' : 'text-outline'}`}
                    style={{ fontSize: '18px' }}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-label-sm text-center leading-tight hidden sm:block ${
                  active ? 'text-primary font-semibold' : completed ? 'text-on-surface-variant' : 'text-outline'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 relative overflow-hidden rounded-full bg-outline-variant/50">
                <motion.div
                  animate={{ scaleX: completed ? 1 : 0 }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  style={{ transformOrigin: 'left' }}
                  className="absolute inset-0 bg-primary rounded-full"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default QuantityStepper
