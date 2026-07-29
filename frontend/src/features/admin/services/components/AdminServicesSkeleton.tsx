import { useTranslation } from 'react-i18next'

export function AdminServicesSkeleton() {
  const { t } = useTranslation('adminServices')

  return (
    <div className="services-skeleton" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{t('loading')}</span>
      <div className="services-skeleton__row" />
      <div className="services-skeleton__row" />
      <div className="services-skeleton__row" />
    </div>
  )
}
