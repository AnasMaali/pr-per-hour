import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/shared/components/ErrorState'
import { env } from '@/shared/config/env'

export function RouteErrorFallback() {
  const error = useRouteError()
  const { t } = useTranslation('errors')

  if (env.isDev && error instanceof Error) {
    console.error('[RouteError]', error.message)
  }

  const status = isRouteErrorResponse(error) ? error.status : null
  const title = status === 404 ? t('notFound') : t('boundaryTitle')
  const description =
    status === 404 ? t('notFoundDescription') : t('boundaryDescription')

  return (
    <div className="app-main">
      <ErrorState title={title} description={description} />
      <div className="cluster" style={{ marginTop: 'var(--space-4)' }}>
        <Link className="btn" to="/">
          {t('goHome')}
        </Link>
      </div>
    </div>
  )
}
