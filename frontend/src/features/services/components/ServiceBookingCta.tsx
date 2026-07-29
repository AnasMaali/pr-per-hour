import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthProvider'
import { env } from '@/shared/config/env'

interface ServiceBookingCtaProps {
  serviceSlug: string
}

/**
 * Service conversion panel.
 * V1 default: contact-first CTA (no book/pay language).
 * Booking branch retained behind feature flag only — do not activate.
 */
export function ServiceBookingCta({ serviceSlug }: ServiceBookingCtaProps) {
  const { t } = useTranslation('services')
  const { isAuthenticated, isClient, isAdmin, isBootstrapping } = useAuth()
  const bookingPath = `/dashboard/bookings/new?service=${encodeURIComponent(serviceSlug)}`

  if (!env.features.bookings) {
    return (
      <aside
        className="service-booking-cta"
        aria-labelledby="service-booking-cta-title"
      >
        <h2 id="service-booking-cta-title">{t('contactCtaTitle')}</h2>
        <p>{t('contactCtaLead')}</p>
        <div className="service-booking-cta__actions">
          <Link className="btn btn--lift" to="/contact">
            {t('contactCtaPrimary')}
          </Link>
          <Link className="btn btn--secondary btn--lift" to="/services">
            {t('detailsBack')}
          </Link>
        </div>
        <p className="service-booking-cta__note">{t('contactCtaNote')}</p>
      </aside>
    )
  }

  return (
    <aside
      className="service-booking-cta"
      aria-labelledby="service-booking-cta-title"
    >
      <h2 id="service-booking-cta-title">{t('bookingCtaTitle')}</h2>
      <p>{t('bookingCtaLead')}</p>

      <div className="service-booking-cta__actions">
        {!isBootstrapping && !isAuthenticated ? (
          <>
            <Link className="btn" to="/login" state={{ from: bookingPath }}>
              {t('bookingCtaGuest')}
            </Link>
            <Link
              className="btn btn--secondary"
              to="/register"
              state={{ from: bookingPath }}
            >
              {t('bookingCtaRegister')}
            </Link>
          </>
        ) : null}

        {!isBootstrapping && isAuthenticated && isClient ? (
          <Link className="btn" to={bookingPath}>
            {t('bookingCtaClient')}
          </Link>
        ) : null}

        {!isBootstrapping && isAuthenticated && isAdmin ? (
          <Link className="btn btn--secondary" to="/services">
            {t('bookingCtaAdmin')}
          </Link>
        ) : null}

        <Link className="btn btn--ghost" to="/contact">
          {t('bookingCtaContact')}
        </Link>
      </div>

      <p className="service-booking-cta__note">{t('bookingNote')}</p>
    </aside>
  )
}
