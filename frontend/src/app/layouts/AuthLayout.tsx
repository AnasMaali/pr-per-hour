import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppLogo } from '@/shared/components/AppLogo'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/shared/components/ThemeSwitcher'
import { SkipLink } from '@/shared/components/SkipLink'
import { AuthBenefitsPanel } from '@/features/auth/components/AuthBenefitsPanel'
import '@/features/auth/styles/auth-pages.css'

export function AuthLayout() {
  const { t } = useTranslation(['common', 'auth'])

  return (
    <div className="auth-layout">
      <SkipLink />
      <header className="auth-layout__header">
        <AppLogo />
        <div className="header-controls">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Link className="btn btn--ghost" to="/">
            {t('auth:backHome')}
          </Link>
        </div>
      </header>
      <main id="main-content" className="auth-layout__main" tabIndex={-1}>
        <div className="auth-layout__grid">
          <AuthBenefitsPanel />
          <Outlet />
        </div>
      </main>
      <footer className="auth-layout__footer">
        <p>{t('common:footerNote')}</p>
      </footer>
    </div>
  )
}
