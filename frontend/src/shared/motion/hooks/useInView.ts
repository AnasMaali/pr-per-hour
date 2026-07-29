import { useEffect, useRef, useState, type RefObject } from 'react'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'

export interface UseInViewOptions {
  rootMargin?: string
  threshold?: number | number[]
  /** Once visible, stay visible (default true). */
  once?: boolean
  /** When reduced motion, treat as immediately in view (default true). */
  immediateWhenReduced?: boolean
}

/**
 * IntersectionObserver reveal helper.
 * Content stays visible by default until motion mode is confirmed, then
 * above-the-fold nodes are marked visible immediately to avoid blank flash.
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  const {
    rootMargin = '0px 0px -8% 0px',
    threshold = 0.12,
    once = true,
    immediateWhenReduced = true,
  } = options

  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()
  const [inView, setInView] = useState(true)
  const [motionReady, setMotionReady] = useState(false)

  useEffect(() => {
    if (reduced && immediateWhenReduced) {
      setInView(true)
      setMotionReady(false)
      return
    }

    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      setMotionReady(false)
      return
    }

    // Enable hidden-until-visible only after we can observe safely.
    setMotionReady(true)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)

    // Synchronous first paint check for already-visible nodes (hero, etc.).
    const rect = node.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      setInView(true)
      if (once) observer.unobserve(node)
    } else {
      setInView(false)
    }

    return () => observer.disconnect()
  }, [reduced, immediateWhenReduced, once, rootMargin, threshold])

  return [ref, !motionReady || inView]
}
