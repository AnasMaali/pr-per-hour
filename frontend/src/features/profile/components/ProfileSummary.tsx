import { useTranslation } from 'react-i18next'
import type { AuthUser } from '@/shared/types/user'

interface ProfileSummaryProps {
  user: AuthUser
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase()
}

export function ProfileSummary({ user }: ProfileSummaryProps) {
  const { t } = useTranslation('profile')
  const initials = initialsFromName(user.name)

  return (
    <section
      className="profile-summary"
      aria-labelledby="profile-summary-heading"
    >
      <h2 id="profile-summary-heading" className="visually-hidden">
        {t('accountInformation')}
      </h2>
      <div className="profile-summary__avatar" aria-hidden="true">
        {initials}
      </div>
      <dl className="profile-summary__list">
        <div>
          <dt>{t('name')}</dt>
          <dd>{user.name}</dd>
        </div>
        <div>
          <dt>{t('email')}</dt>
          <dd className="profile-summary__email">{user.email}</dd>
        </div>
        <div>
          <dt>{t('phone')}</dt>
          <dd>{user.phone?.trim() ? user.phone : t('phoneEmpty')}</dd>
        </div>
        <div>
          <dt>{t('roleLabel')}</dt>
          <dd>{t(`role.${user.role}`)}</dd>
        </div>
        <div>
          <dt>{t('statusLabel')}</dt>
          <dd>{t(`status.${user.status}`)}</dd>
        </div>
      </dl>
    </section>
  )
}
