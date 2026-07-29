import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'

export interface PointerParallaxOptions {
  /** Max translate in CSS pixels (default 10). */
  intensity?: number
  /** Disable on coarse pointers (default true). */
  disableOnTouch?: boolean
}

/**
 * Subtle pointer-driven translate for decorative layers.
 * Writes CSS custom properties; never animates layout properties.
 */
export function usePointerParallax<T extends HTMLElement>(
  options: PointerParallaxOptions = {},
): RefObject<T | null> {
  const { intensity = 10, disableOnTouch = true } = options
  const ref = useRef<T | null>(null)
  const reduced = useReducedMotion()
  const frame = useRef(0)
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const node = ref.current
    if (!node || reduced) return

    if (
      disableOnTouch &&
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return
    }

    const apply = () => {
      frame.current = 0
      node.style.setProperty('--parallax-x', `${target.current.x.toFixed(2)}px`)
      node.style.setProperty('--parallax-y', `${target.current.y.toFixed(2)}px`)
    }

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      target.current = {
        x: nx * intensity,
        y: ny * intensity,
      }
      if (!frame.current) {
        frame.current = window.requestAnimationFrame(apply)
      }
    }

    const onLeave = () => {
      target.current = { x: 0, y: 0 }
      if (!frame.current) {
        frame.current = window.requestAnimationFrame(apply)
      }
    }

    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    return () => {
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      if (frame.current) window.cancelAnimationFrame(frame.current)
    }
  }, [reduced, intensity, disableOnTouch])

  return ref
}
