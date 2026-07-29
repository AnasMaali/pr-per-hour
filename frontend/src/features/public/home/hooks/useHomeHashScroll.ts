import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { scheduleScrollToHash } from '@/shared/utils/scrollToHash'
import { registerGsap, ScrollTrigger } from '@/shared/motion/gsap/registerGsap'

/**
 * Snap scrubbed timelines to the current scroll progress.
 * Needed because numeric `scrub` values lag behind after an instant jump.
 */
function snapScrubbedAnimations() {
  ScrollTrigger.getAll().forEach((st) => {
    const animation = st.animation
    if (animation) {
      animation.progress(st.progress)
    }
  })
}

/**
 * When the homepage hash changes (About / Approach / …), scroll to the section.
 *
 * Uses instant jumps for long distances so pinned scrub sections are not
 * scrubbed during navigation (avoids the mid-scroll hang).
 */
export function useHomeHashScroll() {
  const { hash } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!hash || hash === '#') return

    return scheduleScrollToHash(hash, {
      behavior: reduced ? 'auto' : undefined,
      onRefresh: () => {
        registerGsap()
        ScrollTrigger.refresh()
      },
      onAfterScroll: () => {
        ScrollTrigger.update()
        snapScrubbedAnimations()
      },
    })
  }, [hash, reduced])
}
