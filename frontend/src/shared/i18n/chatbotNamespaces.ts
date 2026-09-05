/**
 * Chatbot translation bundle.
 * Imported only when VITE_FEATURE_CHATBOT_ENABLED === "true" so Vite can
 * omit this JSON module from production builds when the chatbot is off.
 */
import enChatbot from '@/shared/i18n/locales/en/chatbot.json'
import arChatbot from '@/shared/i18n/locales/ar/chatbot.json'

export const chatbotNamespaceNames = ['chatbot'] as const

export const chatbotResources = {
  en: {
    chatbot: enChatbot,
  },
  ar: {
    chatbot: arChatbot,
  },
} as const
