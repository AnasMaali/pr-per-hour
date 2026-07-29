import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { AppLogo } from '@/shared/components/AppLogo'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { SkipLink } from '@/shared/components/SkipLink'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/features/auth/AuthProvider'
import { env } from '@/shared/config/env'
import '@/app/layouts/admin-dashboard-layout.css'

const NAV_ITEMS = [
  { to: '/admin', end: true, key: 'navOverview' as const },
  { to: '/admin/users', end: false, key: 'navUsers' as const },
  { to: '/admin/categories', end: false, key: 'navCategories' as const },
  { to: '/admin/services', end: false, key: 'navServices' as const },
  ...(env.features.bookings
    ? [{ to: '/admin/bookings', end: false, key: 'navBookings' as const }]
    : []),
  {
    to: '/admin/contact-messages',
    end: false,
    key: 'navContactMessages' as const,
  },
]

export function AdminDashboardLayout() {
  const { t } = useTranslation(['admin', 'common'])
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true
      const firstLink = sidebarRef.current?.querySelector('a')
      firstLink?.focus()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
    if (wasOpen.current) {
      menuButtonRef.current?.focus()
      wasOpen.current = false
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="admin-dashboard-layout dashboard-layout">
      <SkipLink />

      {menuOpen ? (
        <button
          type="button"
          className="admin-dashboard-backdrop"
          aria-label={t('admin:closeNavigation')}
          onClick={closeMenu}
        />
      ) : null}

      <aside
        id={sidebarId}
        ref={sidebarRef}
        className={
          menuOpen
            ? 'dashboard-sidebar admin-dashboard-sidebar is-open'
            : 'dashboard-sidebar admin-dashboard-sidebar'
        }
        aria-label={t('admin:administration')}
      >
        <div className="admin-dashboard-sidebar__brand">
          <AppLogo to="/admin" />
          <p className="admin-dashboard-sidebar__label">
            {t('admin:administration')}
          </p>
        </div>

        <nav aria-label={t('admin:adminNavigation')}>
          <ul className="dashboard-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={closeMenu}
                >
                  {t(`admin:${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-dashboard-sidebar__footer">
          <Link className="admin-dashboard-public-link" to="/" onClick={closeMenu}>
            {t('admin:publicWebsite')}
          </Link>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar admin-dashboard-topbar">
          <div className="dashboard-topbar__inner">
            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              className="mobile-nav-toggle"
              aria-expanded={menuOpen}
              aria-controls={sidebarId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X aria-hidden="true" size={20} />
              ) : (
                <Menu aria-hidden="true" size={20} />
              )}
              <span className="visually-hidden">
                {menuOpen
                  ? t('admin:closeNavigation')
                  : t('admin:openNavigation')}
              </span>
            </Button>

            <div className="admin-dashboard-identity">
              <p className="admin-dashboard-identity__name">
                {user
                  ? t('admin:signedInAs', { name: user.name })
                  : t('common:appName')}
              </p>
              {user ? (
                <p className="admin-dashboard-identity__meta">
                  <span>{user.email}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{t('admin:roleAdmin')}</span>
                </p>
              ) : null}
            </div>

            <div className="header-controls">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void logout()}
              >
                {t('admin:logout')}
              </Button>
            </div>
          </div>
        </header>

        <main id="main-content" className="dashboard-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
