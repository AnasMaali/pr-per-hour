import { useEffect, type DependencyList, type RefObject } from 'react'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { registerGsap, ScrollTrigger, gsap } from '@/shared/motion/gsap/registerGsap'

type GsapInstance = typeof gsap
type MatchMedia = ReturnType<GsapInstance['matchMedia']>

/**
 * Scoped GSAP + ScrollTrigger setup for homepage scroll stories.
 * Cleans up via gsap.context; skips entirely under reduced motion.
 */
export function useHomeGsap(
  rootRef: RefObject<HTMLElement | null>,
  setup: (gsapApi: GsapInstance, mm: MatchMedia) => void,
  deps: DependencyList = [],
): void {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    const root = rootRef.current
    if (!root) return

    const gsapApi = registerGsap()
    const ctx = gsapApi.context(() => {
      const mm = gsapApi.matchMedia()
      setup(gsapApi, mm)
    }, root)

    const refreshId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      window.cancelAnimationFrame(refreshId)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, [reduced, rootRef, ...deps])
}
