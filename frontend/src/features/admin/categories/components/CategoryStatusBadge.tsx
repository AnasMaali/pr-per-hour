import { useTranslation } from 'react-i18next'

interface CategoryStatusBadgeProps {
  isActive: boolean
}

export function CategoryStatusBadge({ isActive }: CategoryStatusBadgeProps) {
  const { t } = useTranslation('adminCategories')

  return (
    <span
      className={
        isActive
          ? 'category-status-badge category-status-badge--active'
          : 'category-status-badge category-status-badge--inactive'
      }
    >
      {isActive ? t('active') : t('inactive')}
    </span>
  )
}
