import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { BrandMarkDraw } from '@/shared/components/BrandMarkDraw'
import {
  buildBrandMarkDrawTimeline,
  prepareBrandMarkDraw,
  syncBrandMarkSettleUnmask,
} from '@/shared/components/brandMarkDrawTimeline'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { registerGsap, ScrollTrigger } from '@/shared/motion/gsap/registerGsap'

/**
 * Scroll-scrubbed brand mark section.
 * Reveals the exact final filled silhouette via invisible mask strokes —
 * never a temporary construction shape that later morphs into the logo.
 */
export function LogoDrawSection() {
  const { t } = useTranslation('home')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return

    const section = sectionRef.current
    const pinTarget = pinRef.current
    const svg = markRef.current
    if (!section || !pinTarget || !svg) return

    const gsap = registerGsap()
    const glow = section.querySelector<HTMLElement>('.logo-draw__glow')
    const stage = section.querySelector<HTMLElement>('.logo-draw__stage')
    const { fillLayer, maskUrl } = prepareBrandMarkDraw(gsap, svg, { glow, stage })

    const syncSettle = (progress: number) =>
      syncBrandMarkSettleUnmask(fillLayer, maskUrl, progress)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 641px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
            scrub: 0.75,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => syncSettle(self.progress),
          },
        })

        tl.add(buildBrandMarkDrawTimeline(gsap, svg, { glow, stage })).fromTo(
          section.querySelectorAll('.logo-draw__copy > *'),
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.07,
            ease: 'none',
          },
          0.28,
        )
      })

      mm.add('(max-width: 640px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            end: 'bottom 15%',
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => syncSettle(self.progress),
          },
        })

        tl.add(buildBrandMarkDrawTimeline(gsap, svg, { glow, stage }))
      })
    }, section)

    const refreshId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })

    return () => {
      window.cancelAnimationFrame(refreshId)
      ctx.revert()
    }
  }, [reduced])

  return (
    <section
      ref={sectionRef}
      id="brand"
      className="logo-draw"
      aria-labelledby="logo-draw-title"
    >
      <div ref={pinRef} className="logo-draw__pin">
        <div className="home-container logo-draw__inner">
          <div className="logo-draw__visual">
            <div className="logo-draw__stage" aria-hidden="true">
              <div className="logo-draw__orbit logo-draw__orbit--outer" />
              <div className="logo-draw__orbit logo-draw__orbit--mid" />
              <div className="logo-draw__glow" />
              <div className="logo-draw__halo" />
              <BrandMarkDraw
                ref={markRef}
                className="logo-draw__mark"
                complete={reduced}
              />
            </div>
          </div>

          <div className="logo-draw__copy">
            <p className="home-eyebrow">{t('logoEyebrow')}</p>
            <h2 id="logo-draw-title" className="logo-draw__title">
              {t('logoTitle')}
            </h2>
            <p className="logo-draw__lead">{t('logoLead')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
