import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiClientError } from '@/shared/api/errors'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { InlineLoader } from '@/shared/components/InlineLoader'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { ServiceBookingCta } from '@/features/services/components/ServiceBookingCta'
import {
  ServiceDetailsHero,
  ServiceDetailsMeta,
} from '@/features/services/components/ServiceDetailsHero'
import { usePublicServiceQuery } from '@/features/services/queries/usePublicServiceQuery'
import { truncateText } from '@/features/services/utils/serviceFormatting'
import '@/features/services/styles/service-details.css'
import '@/features/services/styles/services-page.css'

export function ServiceDetailsPage() {
  const { t } = useTranslation('services')
  const { slug } = useParams<{ slug: string }>()
  const query = usePublicServiceQuery(slug)

  const service = query.data
  const isNotFound =
    query.error instanceof ApiClientError &&
    query.error.normalized.status === 404

  const requestId =
    query.error instanceof ApiClientError
      ? query.error.normalized.requestId
      : null

  const metaDescription = service
    ? truncateText(service.description, 160) || t('detailsMetaFallback')
    : t('detailsMetaFallback')

  useDocumentMeta({
    title: service
      ? t('detailsMetaTitle', { title: service.title })
      : t('metaTitle'),
    description: metaDescription,
    canonicalPath:
      !isNotFound && slug
        ? `/services/${encodeURIComponent(slug)}`
        : undefined,
    robots: isNotFound ? 'noindex, follow' : 'index, follow',
    syncThemeColor: true,
  })

  if (query.isPending) {
    return (
      <div className="service-details-page service-details-state">
        <div className="service-details-container">
          <InlineLoader />
        </div>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="service-details-page service-details-state">
        <div className="service-details-container">
          <EmptyState
            title={t('detailsNotFoundTitle')}
            description={t('detailsNotFoundDescription')}
          />
          <p className="service-details-back">
            <Link className="btn" to="/services">
              {t('detailsBack')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (query.isError || !service) {
    return (
      <div className="service-details-page service-details-state">
        <div className="service-details-container">
          <ErrorState
            title={t('detailsErrorTitle')}
            description={t('detailsErrorDescription')}
            requestId={requestId}
            onRetry={() => {
              void query.refetch()
            }}
          />
          <p className="service-details-back">
            <Link className="btn btn--secondary" to="/services">
              {t('detailsBack')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="service-details-page">
      <ServiceDetailsHero service={service} />

      <div className="service-details-container service-details-layout">
        <div className="service-details-content">
          <h2>{t('detailsDescription')}</h2>
          <p>
            {service.description?.trim()
              ? service.description
              : t('detailsDescriptionFallback')}
          </p>
          <p className="service-details-back">
            <Link className="btn btn--secondary" to="/services">
              {t('detailsBack')}
            </Link>
          </p>
        </div>

        <div className="service-details-aside">
          <ServiceDetailsMeta service={service} />
          <ServiceBookingCta serviceSlug={service.slug} />
        </div>
      </div>
    </div>
  )
}
