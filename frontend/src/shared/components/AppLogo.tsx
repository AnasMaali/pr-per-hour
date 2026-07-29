import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { MouseEventHandler } from 'react'
import logoUrl from '@/assets/brand/logo.jpeg'
import { cn } from '@/shared/utils/cn'

interface AppLogoProps {
  to?: string
  showTagline?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function AppLogo({
  to = '/',
  showTagline = false,
  className,
  onClick,
}: AppLogoProps) {
  const { t } = useTranslation('common')

  return (
    <Link to={to} className={cn('app-logo', className)} onClick={onClick}>
      <img src={logoUrl} alt="" width={40} height={40} />
      <span className="app-logo__text">
        <span className="app-logo__name">{t('appName')}</span>
        {showTagline ? (
          <span className="app-logo__tagline">{t('tagline')}</span>
        ) : null}
      </span>
    </Link>
  )
}
