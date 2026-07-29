import { useEffect, useRef, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppLogo } from '@/shared/components/AppLogo'
import { useAuth } from '@/features/auth/AuthProvider'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'
import { scrollToPageTop } from '@/shared/utils/scrollToHash'

/**
 * Public footer with a subtle homepage-only scroll entrance.
 * GSAP loads only on `/` so other public routes stay free of the scroll chunk.
 */
export function PublicFooter() {
  const { t } = useTranslation(['footer', 'navigation'])
  const { isAuthenticated, isClient, isAdmin } = useAuth()
  const year = new Date().getFullYear()
  const reduced = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const footerRef = useRef<HTMLElement>(null)
  const isHome = location.pathname === '/'

  const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) return
    event.preventDefault()
    if (location.hash) {
      void navigate('/', { replace: true })
    }
    scrollToPageTop()
  }
  useEffect(() => {
    if (!isHome || reduced || typeof window === 'undefined') return
    const footer = footerRef.current
    if (!footer) return

    let cancelled = false
    let revert: (() => void) | undefined

    void import('@/shared/motion/gsap/registerGsap').then(
      ({ registerGsap, ScrollTrigger }) => {
        if (cancelled || !footerRef.current) return
        const gsapApi = registerGsap()
        const brand = footer.querySelector('.public-footer__brand')
        const navGroups = footer.querySelectorAll('.public-footer__nav > div')
        const divider = footer.querySelector('.public-footer__bottom')
        const line = footer.querySelector('.public-footer__draw')

        const ctx = gsapApi.context(() => {
          gsapApi.set([brand, navGroups], { opacity: 0, y: 18 })
          gsapApi.set(divider, { opacity: 0, y: 12 })
          gsapApi.set(line, { scaleX: 0, transformOrigin: 'center' })

          gsapApi
            .timeline({
              scrollTrigger: {
                trigger: footer,
                start: 'top 92%',
                end: 'top 55%',
                scrub: 0.45,
                invalidateOnRefresh: true,
              },
            })
            .to(line, { scaleX: 1, duration: 0.35 }, 0)
            .to(brand, { opacity: 1, y: 0, duration: 0.3 }, 0.05)
            .to(
              navGroups,
              { opacity: 1, y: 0, stagger: 0.08, duration: 0.28 },
              0.12,
            )
            .to(divider, { opacity: 1, y: 0, duration: 0.28 }, 0.35)
        }, footer)

        const refreshId = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })

        revert = () => {
          window.cancelAnimationFrame(refreshId)
          ctx.revert()
        }
      },
    )

    return () => {
      cancelled = true
      revert?.()
    }
  }, [isHome, reduced])

  return (
    <footer
      ref={footerRef}
      className="public-footer"
      data-home-motion={isHome && !reduced ? 'true' : undefined}
    >
      <div className="public-footer__draw" aria-hidden="true" />
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <AppLogo showTagline />
          <p>{t('footer:description')}</p>
        </div>

        <nav className="public-footer__nav" aria-label={t('footer:explore')}>
          <div>
            <h2>{t('footer:explore')}</h2>
            <ul>
              <li>
                <Link to="/" onClick={goHome}>
                  {t('footer:home')}
                </Link>
              </li>
              <li>
                <Link to="/services">{t('footer:services')}</Link>
              </li>
              <li>
                <Link to={{ pathname: '/', hash: '#about' }}>
                  {t('footer:about')}
                </Link>
              </li>
              <li>
                <Link to={{ pathname: '/', hash: '#approach' }}>
                  {t('footer:approach')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>{t('footer:company')}</h2>
            <ul>
              <li>
                <Link to="/contact">{t('footer:contact')}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>{t('footer:account')}</h2>
            <ul>
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link to="/login">{t('footer:login')}</Link>
                  </li>
                  <li>
                    <Link to="/register">{t('footer:register')}</Link>
                  </li>
                </>
              ) : null}
              {isClient ? (
                <li>
                  <Link to="/dashboard">{t('navigation:myAccount')}</Link>
                </li>
              ) : null}
              {isAdmin ? (
                <li>
                  <Link to="/admin">{t('navigation:adminDashboard')}</Link>
                </li>
              ) : null}
            </ul>
          </div>
        </nav>
      </div>
      <div className="public-footer__bottom">
        <p>{t('footer:copyright', { year })}</p>
        <p>{t('footer:rightsNote')}</p>
      </div>
    </footer>
  )
}
