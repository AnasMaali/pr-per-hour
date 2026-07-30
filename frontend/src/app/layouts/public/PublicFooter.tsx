import { useEffect, useRef, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { AppLogo } from '@/shared/components/AppLogo'
import { useAuth } from '@/features/auth/AuthProvider'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { scrollToPageTop } from '@/shared/utils/scrollToHash'

/**
 * Premium public footer.
 * Uses progressive GSAP enhancement while preserving a complete
 * static experience when motion is disabled or unavailable.
 */
export function PublicFooter() {
  const { t } = useTranslation(['footer', 'navigation'])
  const { isAuthenticated, isClient, isAdmin } = useAuth()

  const year = new Date().getFullYear()
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const footerRef = useRef<HTMLElement>(null)

  const isHomePage = location.pathname === '/'

  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    if (!isHomePage) return

    event.preventDefault()

    if (location.hash) {
      void navigate('/', { replace: true })
    }

    scrollToPageTop()
  }

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return

    const footer = footerRef.current

    if (!footer) return

    let cancelled = false
    let revertAnimation: (() => void) | undefined

    void import('@/shared/motion/gsap/registerGsap').then(
      ({ registerGsap, ScrollTrigger }) => {
        if (cancelled || !footerRef.current) return

        const gsap = registerGsap()

        const cta = footer.querySelector('.public-footer__cta')
        const brand = footer.querySelector('.public-footer__brand')
        const navigationGroups = footer.querySelectorAll(
          '.public-footer__nav-group',
        )
        const bottom = footer.querySelector('.public-footer__bottom')
        const line = footer.querySelector('.public-footer__draw')
        const ornaments = footer.querySelectorAll(
          '.public-footer__orb, .public-footer__grid',
        )

        const context = gsap.context(() => {
          gsap.set(cta, {
            opacity: 0,
            y: 28,
            scale: 0.985,
          })

          gsap.set(brand, {
            opacity: 0,
            y: 22,
          })

          gsap.set(navigationGroups, {
            opacity: 0,
            y: 22,
          })

          gsap.set(bottom, {
            opacity: 0,
            y: 14,
          })

          gsap.set(line, {
            scaleX: 0,
            transformOrigin: 'center',
          })

          gsap.set(ornaments, {
            opacity: 0,
            scale: 0.9,
          })

          gsap
            .timeline({
              scrollTrigger: {
                trigger: footer,
                start: 'top 94%',
                end: 'top 48%',
                scrub: 0.55,
                invalidateOnRefresh: true,
              },
            })
            .to(
              ornaments,
              {
                opacity: 1,
                scale: 1,
                stagger: 0.08,
                duration: 0.4,
              },
              0,
            )
            .to(
              line,
              {
                scaleX: 1,
                duration: 0.35,
              },
              0,
            )
            .to(
              cta,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.4,
              },
              0.05,
            )
            .to(
              brand,
              {
                opacity: 1,
                y: 0,
                duration: 0.32,
              },
              0.16,
            )
            .to(
              navigationGroups,
              {
                opacity: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.3,
              },
              0.2,
            )
            .to(
              bottom,
              {
                opacity: 1,
                y: 0,
                duration: 0.3,
              },
              0.4,
            )
        }, footer)

        const refreshFrame = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })

        revertAnimation = () => {
          window.cancelAnimationFrame(refreshFrame)
          context.revert()
        }
      },
    )

    return () => {
      cancelled = true
      revertAnimation?.()
    }
  }, [location.pathname, reducedMotion])

  return (
    <footer
      ref={footerRef}
      className="public-footer"
      data-motion={!reducedMotion ? 'enabled' : undefined}
    >
      <div
        className="public-footer__grid"
        aria-hidden="true"
      />

      <div
        className="public-footer__orb public-footer__orb--one"
        aria-hidden="true"
      />

      <div
        className="public-footer__orb public-footer__orb--two"
        aria-hidden="true"
      />

      <div
        className="public-footer__draw"
        aria-hidden="true"
      />

      <div className="public-footer__container">
        <section
          className="public-footer__cta"
          aria-labelledby="footer-cta-title"
        >
          <div className="public-footer__cta-content">
            <p className="public-footer__eyebrow">
              <Sparkles
                aria-hidden="true"
                size={17}
                strokeWidth={1.8}
              />

              <span>{t('footer:rightsNote')}</span>
            </p>

            <h2 id="footer-cta-title">
              {t('footer:description')}
            </h2>
          </div>

          <div className="public-footer__cta-actions">
            <Link
              className="public-footer__primary-action"
              to="/contact"
            >
              <span>{t('footer:contact')}</span>

              <ArrowUpRight
                aria-hidden="true"
                size={18}
              />
            </Link>

            <Link
              className="public-footer__secondary-action"
              to="/services"
            >
              <span>{t('footer:services')}</span>

              <ChevronRight
                className="public-footer__direction-icon"
                aria-hidden="true"
                size={18}
              />
            </Link>
          </div>
        </section>

        <div className="public-footer__inner">
          <div className="public-footer__brand">
            <AppLogo showTagline />

            <p className="public-footer__description">
              {t('footer:description')}
            </p>

            <p className="public-footer__brand-note">
              {t('footer:rightsNote')}
            </p>
          </div>

          <nav
            className="public-footer__nav"
            aria-label={t('footer:explore')}
          >
            <div className="public-footer__nav-group">
              <h2>{t('footer:explore')}</h2>

              <ul>
                <li>
                  <Link to="/" onClick={goHome}>
                    <span>{t('footer:home')}</span>

                    <ChevronRight
                      className="public-footer__direction-icon"
                      aria-hidden="true"
                      size={16}
                    />
                  </Link>
                </li>

                <li>
                  <Link to="/services">
                    <span>{t('footer:services')}</span>

                    <ChevronRight
                      className="public-footer__direction-icon"
                      aria-hidden="true"
                      size={16}
                    />
                  </Link>
                </li>

                <li>
                  <Link to={{ pathname: '/', hash: '#about' }}>
                    <span>{t('footer:about')}</span>

                    <ChevronRight
                      className="public-footer__direction-icon"
                      aria-hidden="true"
                      size={16}
                    />
                  </Link>
                </li>

                <li>
                  <Link to={{ pathname: '/', hash: '#approach' }}>
                    <span>{t('footer:approach')}</span>

                    <ChevronRight
                      className="public-footer__direction-icon"
                      aria-hidden="true"
                      size={16}
                    />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="public-footer__nav-group">
              <h2>{t('footer:company')}</h2>

              <ul>
                <li>
                  <Link to="/contact">
                    <span>{t('footer:contact')}</span>

                    <ChevronRight
                      className="public-footer__direction-icon"
                      aria-hidden="true"
                      size={16}
                    />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="public-footer__nav-group">
              <h2>{t('footer:account')}</h2>

              <ul>
                {!isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/login">
                        <span>{t('footer:login')}</span>

                        <ChevronRight
                          className="public-footer__direction-icon"
                          aria-hidden="true"
                          size={16}
                        />
                      </Link>
                    </li>

                    <li>
                      <Link to="/register">
                        <span>{t('footer:register')}</span>

                        <ChevronRight
                          className="public-footer__direction-icon"
                          aria-hidden="true"
                          size={16}
                        />
                      </Link>
                    </li>
                  </>
                ) : null}

                {isClient ? (
                  <li>
                    <Link to="/dashboard">
                      <span>{t('navigation:myAccount')}</span>

                      <ChevronRight
                        className="public-footer__direction-icon"
                        aria-hidden="true"
                        size={16}
                      />
                    </Link>
                  </li>
                ) : null}

                {isAdmin ? (
                  <li>
                    <Link to="/admin">
                      <span>{t('navigation:adminDashboard')}</span>

                      <ChevronRight
                        className="public-footer__direction-icon"
                        aria-hidden="true"
                        size={16}
                      />
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
          </nav>
        </div>

        <div className="public-footer__bottom">
          <p>{t('footer:copyright', { year })}</p>

          <p className="public-footer__bottom-note">
            <span aria-hidden="true" />
            {t('footer:rightsNote')}
          </p>
        </div>
      </div>
    </footer>
  )
}