export function excerptText(value: string, maxLength = 120): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

export function formatAdminDateTime(
  iso: string,
  locale: string,
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatAdminBookingSlot(
  bookingDate: string,
  startTime: string,
  endTime: string,
): string {
  return `${bookingDate} · ${startTime}–${endTime}`
}
