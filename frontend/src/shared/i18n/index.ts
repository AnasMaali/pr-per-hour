import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { setApiLocaleReader } from '@/shared/api/client'
import {
  applyDocumentLocale,
  DEFAULT_LOCALE,
  type AppLocale,
  persistLocale,
  resolveInitialLocale,
} from '@/shared/i18n/locale'

import enCommon from '@/shared/i18n/locales/en/common.json'
import enNavigation from '@/shared/i18n/locales/en/navigation.json'
import enAuth from '@/shared/i18n/locales/en/auth.json'
import enErrors from '@/shared/i18n/locales/en/errors.json'
import enHome from '@/shared/i18n/locales/en/home.json'
import enFooter from '@/shared/i18n/locales/en/footer.json'
import enServices from '@/shared/i18n/locales/en/services.json'
import enProfile from '@/shared/i18n/locales/en/profile.json'
import enAdmin from '@/shared/i18n/locales/en/admin.json'
import enAdminUsers from '@/shared/i18n/locales/en/adminUsers.json'
import enAdminCategories from '@/shared/i18n/locales/en/adminCategories.json'
import enAdminServices from '@/shared/i18n/locales/en/adminServices.json'
import enAdminContactMessages from '@/shared/i18n/locales/en/adminContactMessages.json'
import enContact from '@/shared/i18n/locales/en/contact.json'

import arCommon from '@/shared/i18n/locales/ar/common.json'
import arNavigation from '@/shared/i18n/locales/ar/navigation.json'
import arAuth from '@/shared/i18n/locales/ar/auth.json'
import arErrors from '@/shared/i18n/locales/ar/errors.json'
import arHome from '@/shared/i18n/locales/ar/home.json'
import arFooter from '@/shared/i18n/locales/ar/footer.json'
import arServices from '@/shared/i18n/locales/ar/services.json'
import arProfile from '@/shared/i18n/locales/ar/profile.json'
import arAdmin from '@/shared/i18n/locales/ar/admin.json'
import arAdminUsers from '@/shared/i18n/locales/ar/adminUsers.json'
import arAdminCategories from '@/shared/i18n/locales/ar/adminCategories.json'
import arAdminServices from '@/shared/i18n/locales/ar/adminServices.json'
import arAdminContactMessages from '@/shared/i18n/locales/ar/adminContactMessages.json'
import arContact from '@/shared/i18n/locales/ar/contact.json'

const initialLocale = resolveInitialLocale()

const coreNamespaces = [
  'common',
  'navigation',
  'auth',
  'errors',
  'home',
  'footer',
  'services',
  'profile',
  'admin',
  'adminUsers',
  'adminCategories',
  'adminServices',
  'adminContactMessages',
  'contact',
] as const

const enCore = {
  common: enCommon,
  navigation: enNavigation,
  auth: enAuth,
  errors: enErrors,
  home: enHome,
  footer: enFooter,
  services: enServices,
  profile: enProfile,
  admin: enAdmin,
  adminUsers: enAdminUsers,
  adminCategories: enAdminCategories,
  adminServices: enAdminServices,
  adminContactMessages: enAdminContactMessages,
  contact: enContact,
}

const arCore = {
  common: arCommon,
  navigation: arNavigation,
  auth: arAuth,
  errors: arErrors,
  home: arHome,
  footer: arFooter,
  services: arServices,
  profile: arProfile,
  admin: arAdmin,
  adminUsers: arAdminUsers,
  adminCategories: arAdminCategories,
  adminServices: arAdminServices,
  adminContactMessages: arAdminContactMessages,
  contact: arContact,
}

const bookingBundle =
  import.meta.env.VITE_FEATURE_BOOKINGS_ENABLED === 'true'
    ? await import('@/shared/i18n/bookingNamespaces')
    : null

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      ...enCore,
      ...(bookingBundle?.bookingResources.en ?? {}),
    },
    ar: {
      ...arCore,
      ...(bookingBundle?.bookingResources.ar ?? {}),
    },
  },
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: [
    ...coreNamespaces,
    ...(bookingBundle?.bookingNamespaceNames ?? []),
  ],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
})

applyDocumentLocale(initialLocale)
setApiLocaleReader(() => (i18n.language?.startsWith('ar') ? 'ar' : 'en'))

i18n.on('languageChanged', (lng) => {
  const locale: AppLocale = lng.startsWith('ar') ? 'ar' : 'en'
  persistLocale(locale)
  applyDocumentLocale(locale)
})

export async function changeAppLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale)
}

export function getCurrentLocale(): AppLocale {
  return i18n.language?.startsWith('ar') ? 'ar' : 'en'
}

export { i18n }
