import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import type { PublicService } from '@/features/services/types/services.types'
import {
  formatServiceDuration,
  truncateText,
} from '@/features/services/utils/serviceFormatting'
import { cn } from '@/shared/utils/cn'

interface ServiceCardProps {
  service: PublicService
  index?: number
  showCategory?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Modern service card used inside category pages.
 * Price is intentionally not presented while payments are disabled.
 */
export function ServiceCard({
  service,
  index,
  showCategory = true,
  className,
  style,
}: ServiceCardProps) {
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

  const displayNumber = String(
    index ?? service.id,
  ).padStart(2, '0')

  const detailsPath = `/services/${service.slug}`

  return (
    <article
      className={cn('service-card', className)}
      style={style}
    >
      <div className="service-card__header">
        <span
          className="service-card__number"
          aria-hidden="true"
        >
          {displayNumber}
        </span>

        {duration ? (
          <span className="service-card__duration">
            <Clock3
              aria-hidden="true"
              size={15}
              strokeWidth={1.8}
            />

            <span className="visually-hidden">
              {t('durationMetaLabel')}:
            </span>

            {duration}
          </span>
        ) : null}
      </div>

      <div className="service-card__body">
        {showCategory && service.category ? (
          <p className="service-card__category">
            {service.category.name}
          </p>
        ) : null}

        <h3>
          <Link to={detailsPath}>
            {service.title}
          </Link>
        </h3>

        {description ? (
          <p className="service-card__description">
            {description}
          </p>
        ) : null}
      </div>

      <Link
        className="service-card__link"
        to={detailsPath}
      >
        <span>{t('viewDetails')}</span>

        <ArrowUpRight
          aria-hidden="true"
          size={18}
          strokeWidth={1.9}
        />
      </Link>
    </article>
  )
}