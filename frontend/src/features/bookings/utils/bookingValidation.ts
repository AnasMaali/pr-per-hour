import type {
  BookingFieldErrors,
  BookingFormValues,
} from '@/features/bookings/types/bookings.types'
import { isValidDateString } from '@/features/bookings/utils/bookingFilters'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidTimeString(value: string): boolean {
  return TIME_PATTERN.test(value)
}

export function todayLocalDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function timeToMinutes(value: string): number | null {
  if (!isValidTimeString(value)) return null
  const parts = value.split(':').map(Number)
  const h = parts[0]
  const m = parts[1]
  if (h === undefined || m === undefined) return null
  return h * 60 + m
}

/**
 * Add duration minutes to a start time on the same calendar day.
 * Returns null if the result would cross midnight (API expects same-day times).
 */
export function addMinutesToTime(
  startTime: string,
  durationMinutes: number,
): string | null {
  const start = timeToMinutes(startTime)
  if (start === null || !Number.isFinite(durationMinutes) || durationMinutes < 0) {
    return null
  }
  const end = start + durationMinutes
  if (end > 24 * 60 - 1) {
    return null
  }
  if (end === 24 * 60) {
    // End at midnight is not representable as same-day H:i after start in a useful way
    return null
  }
  const hours = Math.floor(end / 60)
  const minutes = end % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function validateBookingForm(
  values: BookingFormValues,
): BookingFieldErrors {
  const errors: BookingFieldErrors = {}
  const serviceId = Number.parseInt(values.service_id, 10)
  const today = todayLocalDateString()

  if (!values.service_id || !Number.isFinite(serviceId) || serviceId < 1) {
    errors.service_id = 'validationServiceRequired'
  }

  if (!values.booking_date) {
    errors.booking_date = 'validationRequired'
  } else if (!isValidDateString(values.booking_date)) {
    errors.booking_date = 'validationInvalidDate'
  } else if (values.booking_date < today) {
    errors.booking_date = 'validationDatePast'
  }

  if (!values.start_time) {
    errors.start_time = 'validationRequired'
  } else if (!isValidTimeString(values.start_time)) {
    errors.start_time = 'validationInvalidTime'
  }

  if (!values.end_time) {
    errors.end_time = 'validationRequired'
  } else if (!isValidTimeString(values.end_time)) {
    errors.end_time = 'validationInvalidTime'
  }

  const start = timeToMinutes(values.start_time)
  const end = timeToMinutes(values.end_time)
  if (start !== null && end !== null && end <= start) {
    errors.end_time = 'validationEndAfterStart'
  }

  if (values.notes.length > 5000) {
    errors.notes = 'validationNotesMax'
  }

  return errors
}

export function hasBookingFieldErrors(errors: BookingFieldErrors): boolean {
  return Object.keys(errors).length > 0
}
