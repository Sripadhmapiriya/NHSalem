import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Accordion — animated expand/collapse (height + opacity, never display:none)
 * items: [{ id, title, content }]
 * allowMultiple: false by default (single-open)
 */
export function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-outline-variant rounded-[16px] overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${item.id}`}
        id={`accordion-trigger-${item.id}`}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-surface-container-low transition-colors"
      >
        <span className="text-body-md font-semibold text-on-surface">{item.title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="material-symbols-outlined text-on-surface-variant flex-shrink-0"
          style={{ fontSize: '20px' }}
          aria-hidden="true"
        >
          expand_more
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`panel-${item.id}`}
            id={`accordion-panel-${item.id}`}
            role="region"
            aria-labelledby={`accordion-trigger-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5 text-body-md text-on-surface-variant leading-relaxed border-t border-outline-variant/50">
              <div className="pt-4">
                {typeof item.content === 'string' ? (
                  <p>{item.content}</p>
                ) : (
                  item.content
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Accordion({ items = [], allowMultiple = false, defaultOpen = null }) {
  const [openIds, setOpenIds] = useState(defaultOpen ? [defaultOpen] : [])

  const toggle = (id) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      )
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]))
    }
  }

  return (
    <div className="flex flex-col gap-3" role="list">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          <AccordionItem
            item={item}
            isOpen={openIds.includes(item.id)}
            onToggle={() => toggle(item.id)}
          />
        </div>
      ))}
    </div>
  )
}
