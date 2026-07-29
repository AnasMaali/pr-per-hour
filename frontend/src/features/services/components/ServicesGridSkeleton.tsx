import { useTranslation } from 'react-i18next'

export function ServicesGridSkeleton({ count = 6 }: { count?: number }) {
  const { t } = useTranslation('common')

  return (
    <div
      className="services-grid"
      aria-busy="true"
      aria-live="polite"
      aria-label={t('loading')}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="service-card service-card--skeleton">
          <span className="skeleton" style={{ height: '1rem', width: '40%' }} />
          <span className="skeleton" style={{ height: '1.5rem', width: '75%' }} />
          <span className="skeleton" style={{ height: '4rem', width: '100%' }} />
          <span className="skeleton" style={{ height: '1rem', width: '55%' }} />
        </div>
      ))}
    </div>
  )
}
