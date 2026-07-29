import { useTranslation } from 'react-i18next'

interface ServiceStatusBadgeProps {
  isActive: boolean
}

export function ServiceStatusBadge({ isActive }: ServiceStatusBadgeProps) {
  const { t } = useTranslation('adminServices')

  return (
    <span
      className={
        isActive
          ? 'service-status-badge service-status-badge--active'
          : 'service-status-badge service-status-badge--inactive'
      }
    >
      {isActive ? t('active') : t('inactive')}
    </span>
  )
}
