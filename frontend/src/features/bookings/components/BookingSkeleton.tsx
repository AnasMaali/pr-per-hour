import { useTranslation } from 'react-i18next'

export function BookingSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useTranslation('common')

  return (
    <div
      className="booking-list"
      aria-busy="true"
      aria-live="polite"
      aria-label={t('loading')}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="booking-card booking-card--skeleton">
          <span className="skeleton" style={{ height: '1.25rem', width: '55%' }} />
          <span className="skeleton" style={{ height: '1rem', width: '35%' }} />
          <span className="skeleton" style={{ height: '3rem', width: '100%' }} />
        </div>
      ))}
    </div>
  )
}
