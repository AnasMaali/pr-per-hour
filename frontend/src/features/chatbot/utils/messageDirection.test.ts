import { describe, expect, it } from 'vitest'
import { detectMessageDirection } from '@/features/chatbot/utils/messageDirection'

describe('detectMessageDirection', () => {
  it('detects a plain English message as ltr/en', () => {
    expect(detectMessageDirection('Hello, how can I help you today?')).toEqual({
      dir: 'ltr',
      lang: 'en',
    })
  })

  it('detects a plain Arabic message as rtl/ar', () => {
    expect(detectMessageDirection('مرحباً، كيف يمكنني مساعدتك اليوم؟')).toEqual({
      dir: 'rtl',
      lang: 'ar',
    })
  })

  it('stays rtl/ar for Arabic text containing the brand name "Anas"', () => {
    const message = 'أهلاً! أنا Anas، مساعدك في PR Per Hour.'
    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })

  it('stays rtl/ar for Arabic text containing a company name "PR Per Hour"', () => {
    const message = 'تقدم PR Per Hour خدمات الاتصال الاستراتيجي والعلاقات العامة.'
    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })

  it('stays rtl/ar for Arabic text containing a URL', () => {
    const message = 'يمكنك زيارة موقعنا عبر https://prperhour.com لمزيد من التفاصيل.'
    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })

  it('stays rtl/ar for Arabic text containing an email address', () => {
    const message = 'تواصل معنا عبر info@prperhour.com وسيسعدنا مساعدتك.'
    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })

  it('detects a long Arabic response as rtl/ar', () => {
    const message = Array.from({ length: 20 })
      .map(() => 'هذه فقرة طويلة تشرح خدمات الشركة المختلفة بالتفصيل. ')
      .join('')
    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })

  it('detects an English message referencing an Arabic-market client as ltr/en', () => {
    const message = 'PR Per Hour offers strategic communication and public relations services.'
    expect(detectMessageDirection(message)).toEqual({ dir: 'ltr', lang: 'en' })
  })

  it('falls back to ltr/en for content with no strong-direction letters', () => {
    expect(detectMessageDirection('42 :) 🙂')).toEqual({ dir: 'ltr', lang: 'en' })
  })

  it('falls back to ltr/en for an empty message', () => {
    expect(detectMessageDirection('')).toEqual({ dir: 'ltr', lang: 'en' })
  })

  it('picks the predominant script for genuinely mixed content', () => {
    const mostlyArabic =
      'نص عربي طويل يشرح الخدمة المطلوبة بالتفصيل مع بعض الكلمات Anas PR فقط.'
    const mostlyEnglish =
      'A long English explanation of the service with only a couple of Arabic words مرحبا شكرا.'

    expect(detectMessageDirection(mostlyArabic)).toEqual({ dir: 'rtl', lang: 'ar' })
    expect(detectMessageDirection(mostlyEnglish)).toEqual({ dir: 'ltr', lang: 'en' })
  })

  it('excludes URLs and email addresses from the script count so they never flip a mostly-Arabic message to English', () => {
    const message =
      'أهلاً! أنا Anas من PR Per Hour. يمكنك زيارة ' +
      'https://prperhour.com/services/strategic-communication ' +
      'أو مراسلتنا عبر info@prperhour.com وسيسعدنا مساعدتك.'

    expect(detectMessageDirection(message)).toEqual({ dir: 'rtl', lang: 'ar' })
  })
})
