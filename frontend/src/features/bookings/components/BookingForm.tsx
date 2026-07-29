import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { Textarea } from '@/shared/components/Textarea'
import type { PublicService } from '@/features/services/types/services.types'
import type {
  BookingFieldErrors,
  BookingFormValues,
  CreateBookingPayload,
} from '@/features/bookings/types/bookings.types'
import {
  addMinutesToTime,
  hasBookingFieldErrors,
  todayLocalDateString,
  validateBookingForm,
} from '@/features/bookings/utils/bookingValidation'

interface BookingFormProps {
  services: PublicService[]
  servicesLoading: boolean
  servicesError: boolean
  initialServiceId?: string
  invalidPresetSlug?: boolean
  pending: boolean
  apiFieldErrors: BookingFieldErrors
  formMessage: string | null
  requestId: string | null
  onSubmit: (payload: CreateBookingPayload) => void
}

const INITIAL: BookingFormValues = {
  service_id: '',
  booking_date: '',
  start_time: '',
  end_time: '',
  notes: '',
}

export function BookingForm({
  services,
  servicesLoading,
  servicesError,
  initialServiceId = '',
  invalidPresetSlug = false,
  pending,
  apiFieldErrors,
  formMessage,
  requestId,
  onSubmit,
}: BookingFormProps) {
  const { t } = useTranslation('bookings')
  const formId = useId()
  const [values, setValues] = useState<BookingFormValues>({
    ...INITIAL,
    service_id: initialServiceId,
    booking_date: todayLocalDateString(),
  })
  const [clientErrors, setClientErrors] = useState<BookingFieldErrors>({})
  const [durationHint, setDurationHint] = useState<string | null>(null)
  const endManuallyEdited = useRef(false)
  const appliedInitial = useRef(false)

  useEffect(() => {
    if (appliedInitial.current) return
    if (!initialServiceId) return
    if (services.some((service) => String(service.id) === initialServiceId)) {
      setValues((current) => ({ ...current, service_id: initialServiceId }))
      appliedInitial.current = true
    }
  }, [initialServiceId, services])

  const selectedService = services.find(
    (service) => String(service.id) === values.service_id,
  )

  function update<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function resolveError(value: string | undefined): string | undefined {
    if (!value) return undefined
    if (value.startsWith('validation') || value.startsWith('error')) {
      return t(value)
    }
    return value
  }

  function handleSuggestEndTime() {
    const duration = selectedService?.duration_minutes
    if (!duration || !values.start_time) {
      setDurationHint(t('durationHelperNeedStart'))
      return
    }
    const suggested = addMinutesToTime(values.start_time, duration)
    if (!suggested) {
      setDurationHint(t('durationHelperOverflow'))
      return
    }
    update('end_time', suggested)
    endManuallyEdited.current = false
    setDurationHint(t('durationHelperApplied', { minutes: duration }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const errors = validateBookingForm(values)
    if (hasBookingFieldErrors(errors)) {
      setClientErrors(errors)
      return
    }

    // Ensure selected service is in the fetched public list
    if (!selectedService) {
      setClientErrors({ service_id: 'validationServiceUnavailable' })
      return
    }

    setClientErrors({})
    setDurationHint(null)

    const notes = values.notes.trim()
    onSubmit({
      service_id: Number.parseInt(values.service_id, 10),
      booking_date: values.booking_date,
      start_time: values.start_time,
      end_time: values.end_time,
      notes: notes === '' ? null : notes,
    })
  }

  const serviceOptions = [
    { value: '', label: t('servicePlaceholder') },
    ...services.map((service) => ({
      value: String(service.id),
      label: service.title,
    })),
  ]

  return (
    <form
      className="booking-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending || undefined}
    >
      {invalidPresetSlug ? (
        <p className="booking-form__notice" role="status">
          {t('invalidServicePreset')}
        </p>
      ) : null}

      {formMessage ? (
        <div className="booking-form-error" role="alert" tabIndex={-1}>
          <p>{formMessage}</p>
          {requestId ? (
            <p className="booking-form-error__meta">
              {t('requestId')}: <code>{requestId}</code>
            </p>
          ) : null}
        </div>
      ) : null}

      {servicesError ? (
        <p className="booking-form__notice" role="status">
          {t('servicesLoadError')}
        </p>
      ) : null}

      <Select
        id={`${formId}-service`}
        name="service_id"
        label={t('serviceLabel')}
        options={serviceOptions}
        value={values.service_id}
        onChange={(event) => update('service_id', event.target.value)}
        error={
          resolveError(clientErrors.service_id) ??
          resolveError(apiFieldErrors.service_id)
        }
        disabled={pending || servicesLoading}
        required
      />

      {selectedService?.duration_minutes != null ? (
        <p className="booking-form__hint">
          {t('serviceDuration', {
            minutes: selectedService.duration_minutes,
          })}
        </p>
      ) : null}

      <Input
        id={`${formId}-date`}
        name="booking_date"
        type="date"
        label={t('dateLabel')}
        min={todayLocalDateString()}
        value={values.booking_date}
        onChange={(event) => update('booking_date', event.target.value)}
        error={
          resolveError(clientErrors.booking_date) ??
          resolveError(apiFieldErrors.booking_date)
        }
        disabled={pending}
        required
      />

      <div className="booking-form__times">
        <Input
          id={`${formId}-start`}
          name="start_time"
          type="time"
          label={t('startTimeLabel')}
          value={values.start_time}
          onChange={(event) => update('start_time', event.target.value)}
          error={
            resolveError(clientErrors.start_time) ??
            resolveError(apiFieldErrors.start_time)
          }
          disabled={pending}
          required
        />
        <Input
          id={`${formId}-end`}
          name="end_time"
          type="time"
          label={t('endTimeLabel')}
          value={values.end_time}
          onChange={(event) => {
            endManuallyEdited.current = true
            update('end_time', event.target.value)
          }}
          error={
            resolveError(clientErrors.end_time) ??
            resolveError(apiFieldErrors.end_time)
          }
          disabled={pending}
          required
        />
      </div>

      {selectedService?.duration_minutes != null ? (
        <div className="booking-form__duration-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !values.start_time}
            onClick={handleSuggestEndTime}
          >
            {t('suggestEndTime')}
          </Button>
          {durationHint ? (
            <p className="booking-form__hint" role="status">
              {durationHint}
            </p>
          ) : null}
        </div>
      ) : null}

      <Textarea
        id={`${formId}-notes`}
        name="notes"
        label={t('notesLabel')}
        hint={t('notesHint')}
        rows={4}
        maxLength={5000}
        value={values.notes}
        onChange={(event) => update('notes', event.target.value)}
        error={
          resolveError(clientErrors.notes) ?? resolveError(apiFieldErrors.notes)
        }
        disabled={pending}
      />

      <Button type="submit" disabled={pending} className="booking-form__submit">
        {pending ? t('creating') : t('create')}
      </Button>
    </form>
  )
}
