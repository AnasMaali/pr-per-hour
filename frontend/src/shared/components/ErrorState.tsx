import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'

interface ErrorStateProps {
  title?: string
  description?: string
  requestId?: string | null
  onRetry?: () => void
}

export function ErrorState({
  title,
  description,
  requestId,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation(['common', 'errors'])

  return (
    <div className="state-panel" role="alert">
      <h2>{title ?? t('common:errorTitle')}</h2>
      <p>{description ?? t('common:errorDescription')}</p>
      {requestId ? (
        <p>
          <span>{t('common:requestId')}: </span>
          <code>{requestId}</code>
        </p>
      ) : null}
      {onRetry ? (
        <div>
          <Button type="button" onClick={onRetry}>
            {t('common:retry')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
