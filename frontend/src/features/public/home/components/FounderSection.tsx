import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandMarkDraw } from '@/shared/components/BrandMarkDraw'
import {
  buildBrandMarkDrawTimeline,
  prepareBrandMarkDraw,
  syncBrandMarkSettleUnmask,
} from '@/shared/components/brandMarkDrawTimeline'
import { useHomeGsap } from '@/features/public/home/hooks/useHomeGsap'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'

const POINTS = [
  'founderPoint1',
  'founderPoint2',
  'founderPoint3',
  'founderPoint4',
] as const

/**
 * Executive founder profile.
 * GSAP sequence preserved: portrait → BrandMarkDraw replay → copy → points.
 * Selectors: `.home-founder__portrait`, `.home-founder__copy > :not(.home-founder__points)`,
 * `.home-founder__points li`, markRef on BrandMarkDraw.
 */
export function FounderSection() {
  const { t } = useTranslation('home')
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const markRef = useRef<SVGSVGElement>(null)

  useHomeGsap(sectionRef, (gsapApi) => {
    const section = sectionRef.current
    const svg = markRef.current
    if (!section || !svg) return

    const { fillLayer, maskUrl } = prepareBrandMarkDraw(gsapApi, svg)
    const copyEls = section.querySelectorAll(
      '.home-founder__copy > :not(.home-founder__points)',
    )
    const pointEls = section.querySelectorAll('.home-founder__points li')
    const portrait = section.querySelector<HTMLElement>('.home-founder__portrait')

    if (portrait) gsapApi.set(portrait, { opacity: 0, y: 24, scale: 0.98 })
    if (copyEls.length) gsapApi.set(copyEls, { opacity: 0, y: 28 })
    if (pointEls.length) gsapApi.set(pointEls, { opacity: 0, y: 36 })

    const tl = gsapApi.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        end: 'top 22%',
        scrub: 0.65,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          syncBrandMarkSettleUnmask(fillLayer, maskUrl, self.progress),
      },
    })

    if (portrait) {
      tl.to(
        portrait,
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'none' },
        0,
      )
    }

    tl.add(buildBrandMarkDrawTimeline(gsapApi, svg), 0.04)

    if (copyEls.length) {
      tl.to(
        copyEls,
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'none' },
        0.18,
      )
    }

    if (pointEls.length) {
      tl.to(
        pointEls,
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'none' },
        0.32,
      )
    }
  })

  return (
    <section
      ref={sectionRef}
      id="founder"
      className="home-section home-founder"
      aria-labelledby="home-founder-title"
    >
      <div className="home-container home-founder__grid">
        <figure
          className="home-founder__portrait"
          aria-label={t('founderImageAlt')}
        >
          <BrandMarkDraw
            ref={markRef}
            className="home-founder__mark"
            complete={reduced}
          />
        </figure>

        <div className="home-founder__copy">
          <p className="home-eyebrow">{t('founderEyebrow')}</p>
          <h2 id="home-founder-title">{t('founderTitle')}</h2>
          <p className="home-founder__bio">{t('founderBio')}</p>
          <ul className="home-founder__points">
            {POINTS.map((key) => (
              <li key={key}>
                <span className="home-founder__credential-mark" aria-hidden="true" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
          <Link className="btn btn--lift" to="/contact">
            {t('founderCta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
