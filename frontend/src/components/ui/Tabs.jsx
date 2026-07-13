import { motion, AnimatePresence } from 'framer-motion'

/**
 * Tabs — animated underline indicator, no remount on switch
 * tabs: [{ id, label, icon? }]
 */
export default function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      aria-label="Content tabs"
      className={`flex border-b border-outline-variant overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`
            relative flex items-center gap-2 px-5 py-3.5 text-label-md font-semibold
            whitespace-nowrap transition-colors duration-150 flex-shrink-0
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset
            ${activeTab === tab.id
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
            }
          `}
        >
          {tab.icon && (
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
              {tab.icon}
            </span>
          )}
          {tab.label}
          {/* Animated underline */}
          <AnimatePresence>
            {activeTab === tab.id && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </button>
      ))}
    </div>
  )
}

/**
 * TabPanel — content panel for a tab (no remount)
 */
export function TabPanel({ id, activeTab, children }) {
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={activeTab !== id}
    >
      {children}
    </div>
  )
}
