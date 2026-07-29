import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HeroChamber } from '@/features/public/home/components/HeroChamber'
import { HeroSweepText } from '@/features/public/home/components/HeroSweepText'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { registerGsap } from '@/shared/motion/gsap/registerGsap'

const HERO_CORE_DESKTOP = {
  base: { rotateY: 10, rotateX: -4, y: 6, scale: 0.975 },
  end: { rotateY: 14, rotateX: -5, y: 8, scale: 0.97 },
} as const

const HERO_CORE_COMPACT = {
  base: { rotateY: 6, rotateX: -2, y: 4, scale: 0.99 },
  end: { rotateY: 10, rotateX: -3, y: 8, scale: 0.98 },
} as const

/**
 * PDF §8.2 Hero — premium consultancy introduction.
 * GSAP selectors/refs preserved: .home-hero__reveal, .home-hero__visual,
 * [data-layer="core"], .home-hero__title .hero-word, glows, copy, scroll hint.
 */
export function HeroSection() {
  const { t } = useTranslation(['home', 'common'])
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (reduced || typeof window === 'undefined') return
    const section = sectionRef.current
    const pin = pinRef.current
    if (!section || !pin) return

    const gsap = registerGsap()
    const ctx = gsap.context(() => {
      const reveals = section.querySelectorAll('.home-hero__reveal')
      const visual = section.querySelector('.home-hero__visual')
      const core = section.querySelector<HTMLElement>('[data-layer="core"]')
      const hint = section.querySelector('.home-hero__scroll-hint')
      const words = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll('.home-hero__title .hero-word'),
      )

      const isDesktopViewport = window.matchMedia('(min-width: 1100px)').matches
      const initialPose = isDesktopViewport
        ? HERO_CORE_DESKTOP
        : HERO_CORE_COMPACT

      gsap.set(reveals, { opacity: 0, y: 28 })
      gsap.set(visual, { opacity: 0, scale: 0.92 })
      if (words.length) gsap.set(words, { '--fill-progress': 0 })

      if (core) {
        gsap.set(core, {
          opacity: 0,
          rotateY: initialPose.base.rotateY,
          rotateX: initialPose.base.rotateX,
          y: initialPose.base.y,
          scale: initialPose.base.scale * 0.97,
          transformPerspective: isDesktopViewport ? 1400 : 1200,
          force3D: true,
        })
      }

      const enter = gsap.timeline({ defaults: { ease: 'power3.out' } })
      enter
        .to(reveals, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          clearProps: 'transform',
        })
        .to(
          visual,
          { opacity: 1, scale: 1, duration: 1.05, ease: 'power3.out' },
          0.12,
        )

      if (core) {
        enter.to(
          core,
          {
            opacity: 1,
            scale: initialPose.base.scale,
            duration: 1.15,
            ease: 'power2.out',
          },
          0.2,
        )
      }

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1100px)', () => {
        if (core) {
          gsap.set(core, {
            rotateY: HERO_CORE_DESKTOP.base.rotateY,
            rotateX: HERO_CORE_DESKTOP.base.rotateX,
            y: HERO_CORE_DESKTOP.base.y,
            scale: HERO_CORE_DESKTOP.base.scale,
            transformPerspective: 1400,
            force3D: true,
          })
        }

        const scrubTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=80%',
            scrub: 0.75,
            pin: pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        scrubTl
          .to(
            section.querySelector('.home-hero__glow--gold'),
            { yPercent: 14, scale: 1.1, ease: 'none' },
            0,
          )
          .to(
            section.querySelector('.home-hero__glow--navy'),
            { yPercent: -10, xPercent: 5, ease: 'none' },
            0,
          )
          .to(
            section.querySelector('.home-hero__copy'),
            { y: -10, ease: 'none' },
            0,
          )

        if (core) {
          scrubTl.fromTo(
            core,
            { ...HERO_CORE_DESKTOP.base, transformPerspective: 1400 },
            {
              ...HERO_CORE_DESKTOP.end,
              ease: 'none',
              transformPerspective: 1400,
            },
            0,
          )
        }

        if (words.length) {
          scrubTl.to(
            words,
            {
              '--fill-progress': 1,
              ease: 'none',
              duration: 0.7,
              stagger: { each: 0.16, from: 'start' },
            },
            0.06,
          )
        }

        scrubTl.to(hint, { opacity: 0, y: 16, ease: 'none' }, 0.12)

        return () => {
          scrubTl.scrollTrigger?.kill()
          scrubTl.kill()
        }
      })

      mm.add('(max-width: 1099px)', () => {
        if (core) {
          gsap.set(core, {
            rotateY: HERO_CORE_COMPACT.base.rotateY,
            rotateX: HERO_CORE_COMPACT.base.rotateX,
            y: HERO_CORE_COMPACT.base.y,
            scale: HERO_CORE_COMPACT.base.scale,
            transformPerspective: 1200,
            force3D: true,
          })

          gsap.fromTo(
            core,
            { ...HERO_CORE_COMPACT.base, transformPerspective: 1200 },
            {
              ...HERO_CORE_COMPACT.end,
              ease: 'none',
              transformPerspective: 1200,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        }

        if (words.length) {
          gsap.set(words, { '--fill-progress': 0 })
          gsap.to(words, {
            '--fill-progress': 1,
            ease: 'none',
            stagger: { each: 0.22, from: 'start' },
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 30%',
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          })
        }
      })
    }, section)

    return () => ctx.revert()
  }, [reduced])

  const headline = t('home:heroHeadline')

  return (
    <section
      ref={sectionRef}
      id="home"
      className="home-hero"
      aria-labelledby="home-hero-title"
      data-reduced={reduced ? 'true' : undefined}
    >
      <div ref={pinRef} className="home-hero__pin">
        <div className="home-hero__atmosphere" aria-hidden="true">
          <div className="home-hero__glow home-hero__glow--gold" />
          <div className="home-hero__glow home-hero__glow--navy" />
          <div className="home-hero__mesh" />
          <div className="home-hero__vignette" />
          <div className="home-hero__beam-edge" />
        </div>

        <div className="home-hero__shell">
          <div className="home-hero__compose">
            <div className="home-hero__copy">
              <header className="home-hero__intro">
                <p className="home-eyebrow home-hero__eyebrow home-hero__reveal">
                  {t('home:heroEyebrow')}
                </p>
                <HeroSweepText
                  as="h1"
                  id="home-hero-title"
                  text={headline}
                  className="home-hero__title home-hero__reveal"
                />
                <p className="home-hero__lead home-hero__reveal">
                  {t('home:heroLead')}
                </p>
              </header>

              <div className="home-hero__engage">
                <div className="home-hero__actions home-hero__reveal">
                  <Link
                    className="btn btn--lift home-hero__cta home-hero__cta--primary"
                    to="/contact"
                  >
                    {t('home:heroPrimaryCta')}
                  </Link>
                  <Link
                    className="btn btn--secondary btn--lift home-hero__cta home-hero__cta--secondary"
                    to="/services"
                  >
                    {t('home:heroSecondaryCta')}
                  </Link>
                </div>
                <p className="home-hero__trust home-hero__reveal">
                  {t('home:heroTrust')}
                </p>
              </div>
            </div>

            <div className="home-hero__visual">
              <HeroChamber />
            </div>
          </div>
        </div>

        <div className="home-hero__scroll-hint" aria-hidden="true">
          <span className="home-hero__scroll-pill">
            <i />
          </span>
          <em>{t('home:heroScroll')}</em>
        </div>
      </div>
    </section>
  )
}
