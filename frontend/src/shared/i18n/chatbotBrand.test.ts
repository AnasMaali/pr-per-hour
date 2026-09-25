import { describe, expect, it } from 'vitest'
import en from '@/shared/i18n/locales/en/chatbot.json'
import ar from '@/shared/i18n/locales/ar/chatbot.json'

/**
 * Guards the PRIA rebrand: the chatbot's public-facing translations must
 * never identify the assistant as "Anas" again, in either language. The
 * real person Anas Maali is still a valid subject elsewhere (e.g. the
 * leadership section in home.json) — this test only covers the chatbot
 * namespace, which is exclusively about the AI assistant's own identity.
 */
describe('chatbot translations (brand identity)', () => {
  it.each([
    ['en', en],
    ['ar', ar],
  ])('never identifies the assistant as "Anas" (%s)', (_locale, namespace) => {
    const serialized = JSON.stringify(namespace)

    expect(serialized).not.toContain('Anas')
  })

  it.each([
    ['en', en],
    ['ar', ar],
  ])('names the assistant "PRIA" (%s)', (_locale, namespace) => {
    expect(namespace.assistantName).toBe('PRIA')
  })

  it('gives the assistant the "PR Per Hour AI Assistant" subtitle in English', () => {
    expect(en.assistantRole).toBe('PR Per Hour AI Assistant')
  })
})
