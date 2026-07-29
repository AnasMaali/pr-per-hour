import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
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

/**
 * Client account shell.
 * Bookings nav remains behind the feature flag only (inactive in V1).
 */
export function ClientDashboardLayout() {
  const { t } = useTranslation(['common', 'navigation', 'auth'])
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true
      const firstLink = sidebarRef.current?.querySelector('a, button')
      if (firstLink instanceof HTMLElement) {
        firstLink.focus()
      }
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
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="client-dashboard-layout dashboard-layout">
      <SkipLink />

      {menuOpen ? (
        <button
          type="button"
          className="admin-dashboard-backdrop"
          aria-label={t('common:closeMenu')}
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
        aria-label={t('common:dashboardNavigation')}
      >
        <div className="admin-dashboard-sidebar__brand">
          <AppLogo to="/dashboard" showTagline={false} />
          <p className="admin-dashboard-sidebar__label">
            {t('navigation:myAccount')}
          </p>
        </div>

        <nav aria-label={t('common:dashboardNavigation')}>
          <ul className="dashboard-nav">
            <li>
              <NavLink to="/dashboard" end onClick={closeMenu}>
                {t('navigation:dashboard')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/" end onClick={closeMenu}>
                {t('navigation:home')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/services" onClick={closeMenu}>
                {t('navigation:services')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={closeMenu}>
                {t('navigation:contact')}
              </NavLink>
            </li>
            {env.features.bookings ? (
              <>
                <li>
                  <NavLink to="/dashboard/bookings" onClick={closeMenu}>
                    {t('navigation:myBookings')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/bookings/new" onClick={closeMenu}>
                    {t('navigation:createBooking')}
                  </NavLink>
                </li>
              </>
            ) : null}
            <li>
              <NavLink to="/dashboard/profile" onClick={closeMenu}>
                {t('navigation:profile')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="admin-dashboard-sidebar__footer">
          <Button
            type="button"
            variant="ghost"
            className="dashboard-nav-logout"
            onClick={() => {
              closeMenu()
              void logout()
            }}
          >
            {t('navigation:logout')}
          </Button>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-topbar">
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
                {menuOpen ? t('common:closeMenu') : t('common:openMenu')}
              </span>
            </Button>
            <p className="dashboard-topbar__identity">
              {user
                ? t('auth:signedInAs', { name: user.name })
                : t('common:appName')}
            </p>
            <div className="header-controls">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void logout()}
              >
                {t('navigation:logout')}
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
