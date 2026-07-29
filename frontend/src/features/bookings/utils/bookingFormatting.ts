import type { BookingStatus } from '@/features/bookings/types/bookings.types'

export function formatBookingPrice(price: string, currency: string): string {
  const safePrice = price?.trim() || '0.00'
  const safeCurrency = currency?.trim().toUpperCase() || 'USD'
  return `${safePrice} ${safeCurrency}`
}

/** Normalize API time (may include seconds) to HH:mm for display. */
export function formatBookingTime(value: string | null | undefined): string {
  if (!value) return '—'
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2}:\d{2})/)
  return match?.[1] ?? trimmed
}

export function formatBookingDate(value: string | null | undefined): string {
  if (!value) return '—'
  return value
}

export function canClientCancelStatus(status: BookingStatus): boolean {
  return status === 'pending' || status === 'confirmed'
}

export function meetingLinkHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname || null
  } catch {
    return null
  }
}
