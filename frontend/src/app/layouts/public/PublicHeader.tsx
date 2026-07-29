import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { AppLogo } from '@/shared/components/AppLogo'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/features/auth/AuthProvider'
import { useReducedMotion } from '@/shared/motion'
import { cn } from '@/shared/utils/cn'
import { scrollToHashId, scrollToPageTop } from '@/shared/utils/scrollToHash'
import { useHomeNavSpy } from '@/app/layouts/public/useHomeNavSpy'
import { PublicUserMenu } from '@/app/layouts/public/PublicUserMenu'
import '@/app/layouts/public/public-header.css'

interface RailBox {
  x: number
  width: number
  visible: boolean
}

interface NavItem {
  key: string
  label: string
  to: string
  hash?: string
  isActive: boolean
}

export function PublicHeader() {
  const { t, i18n } = useTranslation(['common', 'navigation'])
  const { isAuthenticated, isAdmin, isClient } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [rail, setRail] = useState<RailBox>({ x: 0, width: 0, visible: false })
  const [hoverRail, setHoverRail] = useState<RailBox | null>(null)
  const navId = useId()
  const desktopListRef = useRef<HTMLUListElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const pathname = location.pathname
  const hash = location.hash
  const isHomePath = pathname === '/'
  const spyKey = useHomeNavSpy(isHomePath)

  const isHomeActive = isHomePath && spyKey === 'home'
  const isAboutActive = isHomePath && spyKey === 'about'
  const isApproachActive = isHomePath && spyKey === 'approach'
  const isContactActive =
    pathname === '/contact' || (isHomePath && spyKey === 'contact')

  const navItems: NavItem[] = [
    {
      key: 'home',
      label: t('navigation:home'),
      to: '/',
      isActive: isHomeActive,
    },
    {
      key: 'services',
      label: t('navigation:services'),
      to: '/services',
      isActive: pathname === '/services' || pathname.startsWith('/services/'),
    },
    {
      key: 'about',
      label: t('navigation:about'),
      to: '/#about',
      hash: '#about',
      isActive: isAboutActive,
    },
    {
      key: 'approach',
      label: t('navigation:approach'),
      to: '/#approach',
      hash: '#approach',
      isActive: isApproachActive,
    },
    {
      key: 'contact',
      label: t('navigation:contact'),
      to: '/#contact',
      hash: '#contact',
      isActive: isContactActive,
    },
  ]

  const measureRail = useCallback(() => {
    const list = desktopListRef.current
    if (!list) return

    const active = list.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (!active) {
      setRail((prev) => (prev.visible ? { ...prev, visible: false } : prev))
      return
    }

    const listRect = list.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    const next = {
      x: activeRect.left - listRect.left,
      width: activeRect.width,
      visible: true,
    }

    setRail((prev) =>
      prev.x === next.x &&
      prev.width === next.width &&
      prev.visible === next.visible
        ? prev
        : next,
    )
  }, [])

  useEffect(() => {
    closeMenu()
  }, [pathname, hash, closeMenu])

  useEffect(() => {
    if (reducedMotion) {
      setReady(true)
      return
    }
    const id = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [reducedMotion])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useLayoutEffect(() => {
    measureRail()
  }, [measureRail, pathname, hash, spyKey, i18n.language, ready])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => measureRail())
    return () => window.cancelAnimationFrame(id)
  }, [i18n.language, measureRail])

  useEffect(() => {
    const onResize = () => measureRail()
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [measureRail])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const menuToggle = menuToggleRef.current

    const panel = mobilePanelRef.current
    const focusables = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)
      : []

    focusables[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu()
        return
      }

      if (event.key !== 'Tab' || focusables.length === 0) return

      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      menuToggle?.focus()
    }
  }, [menuOpen, closeMenu])

  const displayRail = hoverRail?.visible ? hoverRail : rail

  const onLinkEnter = (event: MouseEvent<HTMLElement>) => {
    if (reducedMotion) return
    const list = desktopListRef.current
    const target = event.currentTarget
    if (!list) return
    const listRect = list.getBoundingClientRect()
    const linkRect = target.getBoundingClientRect()
    setHoverRail({
      x: linkRect.left - listRect.left,
      width: linkRect.width,
      visible: true,
    })
  }

  const onLinkLeave = () => {
    setHoverRail(null)
  }

  const renderNavLink = (
    item: NavItem,
    options?: { onNavigate?: () => void; mobile?: boolean },
  ) => {
    const className = cn(
      options?.mobile ? 'public-header__mobile-link' : 'public-header__link',
      item.isActive && 'is-active',
    )

    const shared = {
      className,
      'aria-current': item.isActive ? ('page' as const) : undefined,
      'data-nav-active': item.isActive ? 'true' : undefined,
      onClick: options?.onNavigate,
      onMouseEnter: options?.mobile ? undefined : onLinkEnter,
      onMouseLeave: options?.mobile ? undefined : onLinkLeave,
    }

    if (item.hash) {
      return (
        <Link
          to={{ pathname: '/', hash: item.hash }}
          {...shared}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            options?.onNavigate?.()
            if (pathname !== '/' || !item.hash) return

            if (hash === item.hash) {
              event.preventDefault()
              scrollToHashId(item.hash)
            }
          }}
        >
          <span>{item.label}</span>
        </Link>
      )
    }

    if (item.key === 'home') {
      return (
        <Link
          to="/"
          {...shared}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            options?.onNavigate?.()
            if (pathname !== '/') return

            event.preventDefault()
            if (hash) {
              void navigate('/', { replace: true })
            }
            scrollToPageTop()
          }}
        >
          <span>{item.label}</span>
        </Link>
      )
    }

    return (
      <Link to={item.to} {...shared}>
        <span>{item.label}</span>
      </Link>
    )
  }

  const guestActions = (mobile = false) => (
    <div
      className={cn(
        'public-header__auth-links',
        mobile && 'public-header__auth-links--mobile',
      )}
    >
      <Link
        to="/login"
        className={cn(
          'public-header__login',
          mobile && 'public-header__login--mobile',
        )}
        onClick={mobile ? closeMenu : undefined}
      >
        {t('navigation:login')}
      </Link>
      <Link
        to="/register"
        className={cn(
          'btn public-header__signup',
          mobile && 'public-header__signup--mobile',
        )}
        onClick={mobile ? closeMenu : undefined}
      >
        {t('navigation:signUp')}
      </Link>
    </div>
  )

  const accountActions = (mobile = false) => {
    if (!isAuthenticated) return guestActions(mobile)
    if (!isAdmin && !isClient) return null
    return (
      <PublicUserMenu
        mobile={mobile}
        onNavigate={mobile ? closeMenu : undefined}
      />
    )
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        'public-header',
        menuOpen && 'public-header--menu-open',
        reducedMotion && 'public-header--reduced',
        ready && 'public-header--ready',
        scrolled && 'public-header--scrolled',
      )}
    >
      <div className="public-header__line" aria-hidden="true" />

      <div className="public-header__frame">
        <div className="public-header__brand">
          <AppLogo
            showTagline={false}
            className="public-header__logo"
            onClick={(event) => {
              if (pathname !== '/') return
              event.preventDefault()
              if (hash) {
                void navigate('/', { replace: true })
              }
              scrollToPageTop()
            }}
          />
        </div>

        <nav
          className="public-header__rail public-header__rail--desktop"
          aria-label={t('common:mainNavigation')}
        >
          <ul ref={desktopListRef} className="public-header__list">
            <li
              className={cn(
                'public-header__active-rail',
                hoverRail?.visible && 'is-preview',
              )}
              aria-hidden="true"
              style={{
                transform: `translateX(${displayRail.x}px)`,
                width: displayRail.width,
                opacity: displayRail.visible ? 1 : 0,
              }}
            />
            {navItems.map((item, index) => (
              <li
                key={item.key}
                style={{ '--stagger': index } as CSSProperties}
              >
                {renderNavLink(item)}
              </li>
            ))}
          </ul>
        </nav>

        <div className="public-header__utilities">
          <div className="public-header__auth public-header__auth--desktop">
            {accountActions(false)}
          </div>

          <div className="public-header__lang public-header__lang--desktop">
            <LanguageSwitcher />
          </div>

          <ThemeSwitcher className="public-header__theme" />

          <Button
            ref={menuToggleRef}
            type="button"
            variant="ghost"
            className="public-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={navId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X aria-hidden="true" size={22} />
            ) : (
              <Menu aria-hidden="true" size={22} />
            )}
            <span className="visually-hidden">
              {menuOpen ? t('common:closeMenu') : t('common:openMenu')}
            </span>
          </Button>
        </div>
      </div>

      <div
        className={cn('public-header__overlay', menuOpen && 'is-open')}
        aria-hidden="true"
        onClick={closeMenu}
      />

      <div
        ref={mobilePanelRef}
        id={navId}
        className={cn('public-header__panel', menuOpen && 'is-open')}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <nav
          className="public-header__panel-nav"
          aria-label={t('common:mainNavigation')}
        >
          <ul className="public-header__panel-list">
            {navItems.map((item, index) => (
              <li
                key={item.key}
                style={{ '--stagger': index } as CSSProperties}
              >
                {renderNavLink(item, { onNavigate: closeMenu, mobile: true })}
              </li>
            ))}
          </ul>
        </nav>

        <div className="public-header__panel-footer">
          {accountActions(true)}
          <div className="public-header__panel-tools">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
