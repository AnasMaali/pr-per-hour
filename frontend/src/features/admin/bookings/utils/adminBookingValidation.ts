import {
  MEETING_LINK_MAX_LENGTH,
  NOTES_MAX_LENGTH,
} from '@/features/admin/bookings/utils/adminBookingFilters'

export function validateMeetingLinkInput(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (trimmed.length > MEETING_LINK_MAX_LENGTH) {
    return 'validationMeetingLinkMax'
  }
  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'validationMeetingLinkFormat'
    }
  } catch {
    return 'validationMeetingLinkFormat'
  }
  return null
}

export function validateNotesInput(value: string): string | null {
  if (value.length > NOTES_MAX_LENGTH) {
    return 'validationNotesMax'
  }
  return null
}

/** Empty input clears to null (backend `present` + nullable). */
export function meetingLinkToPayload(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function notesToPayload(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function validateDateRange(
  dateFrom: string,
  dateTo: string,
): string | null {
  if (!dateFrom || !dateTo) return null
  if (dateFrom > dateTo) return 'validationDateRange'
  return null
}
