import { useState, useEffect, useRef } from 'react'

/**
 * useInView — returns true when the element is visible in the viewport
 * @param {{ threshold?, once?, margin? }} opts
 */
export default function useInView(opts = {}) {
  const { threshold = 0, once = true, margin = '0px' } = opts
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin: margin }
    )

    observer.observe(el)
    return () => observer.unobserve(el)
  }, [threshold, once, margin])

  return [ref, inView]
}

/**
 * useCountUp — animate a number from 0 to target when inView
 * @param {number} target
 * @param {number} duration - ms
 */
export function useCountUp(target, duration = 2000, inView = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return count
}
