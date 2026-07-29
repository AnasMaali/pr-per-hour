import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { cn } from '@/shared/utils/cn'

interface RouteTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Restrained public-route enter transition.
 * Content stays visible by default (no opacity:0 resting state).
 * Animate only on subsequent navigations via a short pending class.
 */
export function RouteTransition({ children, className }: RouteTransitionProps) {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    const node = ref.current
    if (!node || reduced) return

    if (first.current) {
      first.current = false
      return
    }

    node.classList.add('is-pending')
    void node.offsetWidth
    node.classList.remove('is-pending')
    node.classList.add('is-entered')
    const timer = window.setTimeout(() => {
      node.classList.remove('is-entered')
    }, 320)
    return () => window.clearTimeout(timer)
  }, [pathname, reduced])

  return (
    <div
      ref={ref}
      className={cn('motion-route', reduced && 'motion-route--instant', className)}
    >
      {children}
    </div>
  )
}
