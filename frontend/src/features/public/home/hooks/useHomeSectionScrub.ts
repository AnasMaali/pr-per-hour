import { type RefObject } from 'react'
import { useHomeGsap } from '@/features/public/home/hooks/useHomeGsap'

type ScrubOptions = {
  /** CSS selector for header / copy block that leads the reveal. */
  header?: string
  /** CSS selector for staggered items (cards, steps, etc.). */
  items?: string
  /** Extra visual element (banner, portrait, form). */
  visual?: string
  start?: string
  end?: string
}

/**
 * Scroll-scrubbed section choreography for PDF homepage blocks.
 * Ties opacity/transform to scroll progress instead of one-shot reveals.
 */
export function useHomeSectionScrub(
  sectionRef: RefObject<HTMLElement | null>,
  {
    header,
    items,
    visual,
    start = 'top 82%',
    end = 'top 30%',
  }: ScrubOptions = {},
): void {
  useHomeGsap(sectionRef, (gsapApi) => {
    const section = sectionRef.current
    if (!section) return

    const headerEls = header ? section.querySelectorAll(header) : []
    const itemEls = items ? section.querySelectorAll(items) : []
    const visualEls = visual ? section.querySelectorAll(visual) : []

    if (!headerEls.length && !itemEls.length && !visualEls.length) return

    if (headerEls.length) gsapApi.set(headerEls, { opacity: 0, y: 28 })
    if (itemEls.length) gsapApi.set(itemEls, { opacity: 0, y: 36 })
    if (visualEls.length) gsapApi.set(visualEls, { opacity: 0, y: 32, scale: 0.97 })

    const tl = gsapApi.timeline({
      scrollTrigger: {
        trigger: section,
        start,
        end,
        scrub: 0.65,
        invalidateOnRefresh: true,
      },
    })

    if (headerEls.length) {
      tl.to(headerEls, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'none' }, 0)
    }

    if (visualEls.length) {
      tl.to(
        visualEls,
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'none' },
        headerEls.length ? 0.12 : 0,
      )
    }

    if (itemEls.length) {
      tl.to(
        itemEls,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'none',
        },
        0.18,
      )
    }
  })
}
