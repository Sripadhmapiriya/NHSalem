import { useState, useEffect } from 'react'

/**
 * useDebounce — debounces a value by the given delay (ms)
 * @param {any} value
 * @param {number} delay - milliseconds (default 300)
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
