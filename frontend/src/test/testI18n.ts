import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enChatbot from '@/shared/i18n/locales/en/chatbot.json'
import enCommon from '@/shared/i18n/locales/en/common.json'
import enErrors from '@/shared/i18n/locales/en/errors.json'
import arChatbot from '@/shared/i18n/locales/ar/chatbot.json'
import arCommon from '@/shared/i18n/locales/ar/common.json'
import arErrors from '@/shared/i18n/locales/ar/errors.json'

/**
 * A standalone i18next instance for component tests, with the real
 * chatbot copy (not a key-passthrough mock) so assertions exercise actual
 * English/Arabic strings. Independent of `@/shared/i18n`'s app bootstrap,
 * which only loads the chatbot namespace when the Vite feature flag is on
 * at build time — irrelevant, and unavailable, in the test environment.
 */
export const testI18n = i18next.createInstance()

void testI18n.use(initReactI18next).init({
  resources: {
    en: { chatbot: enChatbot, common: enCommon, errors: enErrors },
    ar: { chatbot: arChatbot, common: arCommon, errors: arErrors },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['chatbot', 'common', 'errors'],
  interpolation: { escapeValue: false },
  returnNull: false,
})
