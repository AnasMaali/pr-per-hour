/**
 * Booking / admin-booking translation bundles.
 * Imported only when VITE_FEATURE_BOOKINGS_ENABLED === "true" so Vite can
 * omit these JSON modules from production builds when bookings are off.
 */
import enBookings from '@/shared/i18n/locales/en/bookings.json'
import enAdminBookings from '@/shared/i18n/locales/en/adminBookings.json'
import arBookings from '@/shared/i18n/locales/ar/bookings.json'
import arAdminBookings from '@/shared/i18n/locales/ar/adminBookings.json'

export const bookingNamespaceNames = ['bookings', 'adminBookings'] as const

export const bookingResources = {
  en: {
    bookings: enBookings,
    adminBookings: enAdminBookings,
  },
  ar: {
    bookings: arBookings,
    adminBookings: arAdminBookings,
  },
} as const
