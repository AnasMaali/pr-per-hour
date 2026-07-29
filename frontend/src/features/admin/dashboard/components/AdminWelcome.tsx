import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/shared/types/user'

interface AdminWelcomeProps {
  user: AuthUser | null
}

export function AdminWelcome({ user }: AdminWelcomeProps) {
  const { t } = useTranslation('admin')

  return (
    <header className="admin-overview-header">
      <div>
        <h1>{t('overviewTitle')}</h1>
        <p>
          {user
            ? t('welcomeNamed', { name: user.name })
            : t('welcome')}
        </p>
        <p className="admin-overview-header__lead">{t('overviewLead')}</p>
      </div>
    </header>
  )
}
