import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Reusable Select Dropdown Component
 * Features pill-shaped trigger, chevron rotate animation, custom menu styling,
 * keyboard navigation, and full ARIA accessibility.
 */
export default function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Select option',
  className = '',
  id,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef(null)

  // Map option structures (accepts value/id and label)
  const normalizedOptions = options.map((opt) => ({
    value: opt.value !== undefined ? opt.value : opt.id,
    label: opt.label,
  }))

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  const toggleDropdown = () => setIsOpen(!isOpen)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setIsOpen(true)
        const selectedIdx = normalizedOptions.findIndex((opt) => opt.value === value)
        setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0)
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % normalizedOptions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + normalizedOptions.length) % normalizedOptions.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const option = normalizedOptions[highlightedIndex]
      if (option) {
        onChange?.(option.value)
      }
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between rounded-full border bg-white px-5 py-2.5 text-label-md text-on-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all ${
          error ? 'border-error' : isOpen ? 'border-primary' : 'border-outline-variant hover:border-primary/50'
        }`}
      >
        <span className="truncate pr-2 font-medium">{displayLabel}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="material-symbols-outlined text-outline-variant flex-shrink-0"
          style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}
        >
          expand_more
        </motion.span>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            aria-activedescendant={selectedOption ? `opt-${selectedOption.value}` : undefined}
            className="absolute z-50 left-0 right-0 max-h-60 overflow-y-auto bg-white border border-outline-variant/30 rounded-[18px] shadow-card py-1.5 focus:outline-none"
            style={{ top: '100%' }}
          >
            {normalizedOptions.map((opt, index) => {
              const isSelected = value === opt.value
              const isHighlighted = highlightedIndex === index

              return (
                <li
                  key={opt.value}
                  id={`opt-${opt.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    onChange?.(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-5 py-2.5 text-label-md cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-surface-container-low' : 'bg-transparent'
                  } ${isSelected ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}
                >
                  <span className="truncate pr-4">{opt.label}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
                      check
                    </span>
                  )}
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <p className="text-label-sm text-error mt-1.5 pl-2">{error}</p>
      )}
    </div>
  )
}
