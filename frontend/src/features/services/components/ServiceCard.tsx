import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { CSSProperties } from 'react'
import type { PublicService } from '@/features/services/types/services.types'
import {
  formatServiceDuration,
  truncateText,
} from '@/features/services/utils/serviceFormatting'
import { cn } from '@/shared/utils/cn'

interface ServiceCardProps {
  service: PublicService
  className?: string
  style?: CSSProperties
}

/**
 * Editorial service row. Accepts className/style for StaggerGroup.
 * Price is intentionally not presented (payments disabled).
 */
export function ServiceCard({ service, className, style }: ServiceCardProps) {
  const { t } = useTranslation('services')
  const description = truncateText(service.description)
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

  return (
    <article className={cn('service-card', className)} style={style}>
      <div className="service-card__body">
        {service.category ? (
          <p className="service-card__category">{service.category.name}</p>
        ) : null}
        <h3>
          <Link to={`/services/${service.slug}`}>{service.title}</Link>
        </h3>
        {description ? (
          <p className="service-card__description">{description}</p>
        ) : null}
        {duration ? (
          <p className="service-card__duration">
            <span className="visually-hidden">{t('durationMetaLabel')}: </span>
            {duration}
          </p>
        ) : null}
      </div>
      <Link className="service-card__link" to={`/services/${service.slug}`}>
        {t('viewDetails')}
        <span aria-hidden="true"> →</span>
      </Link>
    </article>
  )
}
