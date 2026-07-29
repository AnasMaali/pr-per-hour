import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PublicService } from '@/features/services/types/services.types'
import { formatServiceDuration } from '@/features/services/utils/serviceFormatting'

interface ServiceDetailsHeroProps {
  service: PublicService
}

export function ServiceDetailsHero({ service }: ServiceDetailsHeroProps) {
  const { t } = useTranslation('services')

  return (
    <header className="service-details-hero">
      <div className="service-details-container">
        <nav aria-label={t('breadcrumbServices')}>
          <ol className="services-breadcrumb">
            <li>
              <Link to="/">{t('breadcrumbHome')}</Link>
            </li>
            <li className="services-breadcrumb__sep" aria-hidden="true">
              /
            </li>
            <li>
              <Link to="/services">{t('breadcrumbServices')}</Link>
            </li>
            <li className="services-breadcrumb__sep" aria-hidden="true">
              /
            </li>
            <li aria-current="page">{service.title}</li>
          </ol>
        </nav>

        {service.category ? (
          <p className="service-details-hero__category">
            {service.category.name}
          </p>
        ) : null}

        <h1 className="service-details-hero__title">{service.title}</h1>
      </div>
    </header>
  )
}

interface ServiceDetailsMetaProps {
  service: PublicService
}

/** Summary meta — price omitted (payments disabled). */
export function ServiceDetailsMeta({ service }: ServiceDetailsMetaProps) {
  const { t } = useTranslation('services')
  const hasDuration =
    service.duration_minutes !== null &&
    service.duration_minutes !== undefined &&
    Number.isFinite(service.duration_minutes)
  const duration = hasDuration
    ? formatServiceDuration(
        service.duration_minutes,
        (values) => t('durationValue', values),
        t('durationUnavailable'),
      )
    : null

  if (!service.category && !duration) {
    return null
  }

  return (
    <section
      className="service-details-meta"
      aria-labelledby="service-details-summary-title"
    >
      <h2 id="service-details-summary-title">{t('detailsSummary')}</h2>
      <dl>
        {service.category ? (
          <div>
            <dt>{t('categoryMetaLabel')}</dt>
            <dd>{service.category.name}</dd>
          </div>
        ) : null}
        {duration ? (
          <div>
            <dt>{t('durationMetaLabel')}</dt>
            <dd>{duration}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
