import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta'
import { BookingForm } from '@/features/bookings/components/BookingForm'
import { useBookingServicesOptionsQuery } from '@/features/bookings/queries/useBookingServicesOptionsQuery'
import { useCreateBookingMutation } from '@/features/bookings/queries/useCreateBookingMutation'
import type {
  BookingFieldErrors,
  CreateBookingPayload,
} from '@/features/bookings/types/bookings.types'
import { mapBookingApiError } from '@/features/bookings/utils/mapBookingApiError'
import '@/features/bookings/styles/client-bookings.css'

export function CreateBookingPage() {
  const { t } = useTranslation('bookings')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const serviceSlug = searchParams.get('service')?.trim() ?? ''
  const servicesQuery = useBookingServicesOptionsQuery()
  const createMutation = useCreateBookingMutation()
  const [apiFieldErrors, setApiFieldErrors] = useState<BookingFieldErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formMessageKey, setFormMessageKey] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const services = servicesQuery.data ?? []

  const { initialServiceId, invalidPresetSlug } = useMemo(() => {
    const list = servicesQuery.data ?? []
    if (!serviceSlug) {
      return { initialServiceId: '', invalidPresetSlug: false }
    }
    if (servicesQuery.isPending) {
      return { initialServiceId: '', invalidPresetSlug: false }
    }
    const match = list.find((service) => service.slug === serviceSlug)
    if (match) {
      return { initialServiceId: String(match.id), invalidPresetSlug: false }
    }
    return { initialServiceId: '', invalidPresetSlug: true }
  }, [serviceSlug, servicesQuery.data, servicesQuery.isPending])

  useDocumentMeta({
    title: t('createMetaTitle'),
    description: t('createMetaDescription'),
    robots: 'noindex, nofollow',
    syncThemeColor: true,
  })

  async function handleSubmit(payload: CreateBookingPayload) {
    setApiFieldErrors({})
    setFormMessage(null)
    setFormMessageKey(null)
    setRequestId(null)
    setSuccessMessage(null)

    try {
      const response = await createMutation.mutateAsync(payload)
      setSuccessMessage(t('createSuccess'))
      navigate(`/dashboard/bookings/${response.data.id}`, {
        replace: true,
        state: { bookingCreated: true },
      })
    } catch (error) {
      const mapped = mapBookingApiError(error)
      setApiFieldErrors(mapped.fieldErrors)
      setRequestId(mapped.requestId)
      setFormMessageKey(mapped.formMessageKey)
      setFormMessage(
        mapped.formMessageKey
          ? t(mapped.formMessageKey)
          : mapped.formMessage,
      )
    }
  }

  return (
    <div className="client-bookings-page">
      <header className="client-bookings-header">
        <div>
          <h1>{t('createTitle')}</h1>
          <p>{t('createLead')}</p>
        </div>
        <Link className="btn btn--secondary" to="/dashboard/bookings">
          {t('backToBookings')}
        </Link>
      </header>

      {successMessage ? (
        <p className="booking-form__success" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="booking-form-panel">
        <BookingForm
          key={`${initialServiceId}-${serviceSlug}`}
          services={services}
          servicesLoading={servicesQuery.isPending}
          servicesError={servicesQuery.isError}
          initialServiceId={initialServiceId}
          invalidPresetSlug={invalidPresetSlug}
          pending={createMutation.isPending}
          apiFieldErrors={apiFieldErrors}
          formMessage={formMessage ?? (formMessageKey ? t(formMessageKey) : null)}
          requestId={requestId}
          onSubmit={(payload) => {
            void handleSubmit(payload)
          }}
        />
      </div>
    </div>
  )
}
