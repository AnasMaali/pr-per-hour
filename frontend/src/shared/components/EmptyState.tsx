import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { t } = useTranslation('common')

  return (
    <div className="state-panel">
      <h2>{title ?? t('emptyTitle')}</h2>
      <p>{description ?? t('emptyDescription')}</p>
    </div>
  )
}
