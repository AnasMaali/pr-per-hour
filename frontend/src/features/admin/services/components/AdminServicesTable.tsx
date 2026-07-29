import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { ServiceStatusBadge } from '@/features/admin/services/components/ServiceStatusBadge'
import type { AdminService } from '@/features/admin/services/types/adminServices.types'
import {
  excerptDescription,
  formatServiceDate,
  formatServiceDuration,
  formatServicePrice,
} from '@/features/admin/services/utils/serviceFormatting'

interface AdminServicesTableProps {
  services: AdminService[]
  onEdit: (service: AdminService) => void
  onDelete: (service: AdminService) => void
}

export function AdminServicesTable({
  services,
  onEdit,
  onDelete,
}: AdminServicesTableProps) {
  const { t, i18n } = useTranslation('adminServices')

  return (
    <>
      <div className="services-table-wrap">
        <table className="services-table">
          <thead>
            <tr>
              <th scope="col">{t('title')}</th>
              <th scope="col">{t('category')}</th>
              <th scope="col">{t('price')}</th>
              <th scope="col">{t('duration')}</th>
              <th scope="col">{t('status')}</th>
              <th scope="col">{t('updated')}</th>
              <th scope="col">
                <span className="visually-hidden">{t('actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>
                  <div className="services-table__title">
                    <strong>{service.title}</strong>
                    <code>{service.slug}</code>
                    {service.description ? (
                      <p>{excerptDescription(service.description)}</p>
                    ) : null}
                  </div>
                </td>
                <td>
                  {service.category ? (
                    <span>
                      {service.category.name}
                    </span>
                  ) : (
                    <span className="services-table__muted">
                      {t('unknownCategory')}
                    </span>
                  )}
                </td>
                <td>
                  <code>
                    {formatServicePrice(service.price, service.currency)}
                  </code>
                </td>
                <td>
                  {formatServiceDuration(
                    service.duration_minutes,
                    t('noDuration'),
                  )}
                  {service.duration_minutes !== null
                    ? ` ${t('minutesUnit')}`
                    : ''}
                </td>
                <td>
                  <ServiceStatusBadge isActive={service.is_active} />
                </td>
                <td>{formatServiceDate(service.updated_at, i18n.language)}</td>
                <td>
                  <div className="services-table__actions">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onEdit(service)}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="btn--danger"
                      onClick={() => onDelete(service)}
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="services-card-list">
        {services.map((service) => (
          <li key={service.id} className="service-card">
            <div className="service-card__header">
              <p className="service-card__title">{service.title}</p>
              <ServiceStatusBadge isActive={service.is_active} />
            </div>
            <p className="service-card__slug">
              <code>{service.slug}</code>
            </p>
            <p className="service-card__meta">
              {t('category')}:{' '}
              {service.category?.name ?? t('unknownCategory')}
            </p>
            <p className="service-card__meta">
              {t('price')}:{' '}
              <code>
                {formatServicePrice(service.price, service.currency)}
              </code>
            </p>
            <p className="service-card__meta">
              {t('duration')}:{' '}
              {formatServiceDuration(
                service.duration_minutes,
                t('noDuration'),
              )}
              {service.duration_minutes !== null
                ? ` ${t('minutesUnit')}`
                : ''}
            </p>
            {service.description ? (
              <p className="service-card__description">
                {excerptDescription(service.description)}
              </p>
            ) : (
              <p className="service-card__description service-card__description--empty">
                {t('noDescription')}
              </p>
            )}
            <p className="service-card__meta">
              {t('updated')}:{' '}
              {formatServiceDate(service.updated_at, i18n.language)}
            </p>
            <div className="service-card__actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEdit(service)}
              >
                {t('edit')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="btn--danger"
                onClick={() => onDelete(service)}
              >
                {t('delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
