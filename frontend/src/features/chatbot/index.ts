/**
 * Chatbot feature public exports.
 * Mount <AnasChatWidget /> once at a layout boundary — it renders nothing
 * when VITE_FEATURE_CHATBOT_ENABLED is off, and lazy-loads everything
 * past the launcher only once the visitor opens it.
 */
export { AnasChatWidget } from '@/features/chatbot/components/AnasChatWidget'
