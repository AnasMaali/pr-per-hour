import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { testI18n } from '@/test/testI18n'
import { AnasMessage } from '@/features/chatbot/components/AnasMessage'
import type { ChatMessageViewModel } from '@/features/chatbot/types/chatbot.types'

function assistantMessage(message: string): ChatMessageViewModel {
  return {
    localId: 'msg-1',
    sender: 'bot',
    message,
    createdAt: '2026-01-01T10:00:00.000Z',
    status: 'sent',
  }
}

function visitorMessage(message: string): ChatMessageViewModel {
  return {
    localId: 'msg-2',
    sender: 'visitor',
    message,
    createdAt: '2026-01-01T10:00:00.000Z',
    status: 'sent',
  }
}

function getAssistantBody(): HTMLElement {
  return document.querySelector('.anas-message__assistant-body') as HTMLElement
}

function getVisitorBubble(): HTMLElement {
  return document.querySelector('.anas-message__bubble') as HTMLElement
}

describe('AnasMessage', () => {
  afterEach(async () => {
    await testI18n.changeLanguage('en')
  })

  it('renders an Arabic assistant reply as rtl/ar while the UI locale is English', () => {
    renderWithProviders(
      <AnasMessage
        message={assistantMessage('مرحباً، كيف يمكنني مساعدتك اليوم؟')}
        reducedMotion
      />,
    )

    const body = getAssistantBody()
    expect(body).toHaveAttribute('dir', 'rtl')
    expect(body).toHaveAttribute('lang', 'ar')
  })

  it('renders an English assistant reply as ltr/en while the UI locale is Arabic', async () => {
    await testI18n.changeLanguage('ar')

    renderWithProviders(
      <AnasMessage
        message={assistantMessage('PR Per Hour offers strategic communication services.')}
        reducedMotion
      />,
    )

    const body = getAssistantBody()
    expect(body).toHaveAttribute('dir', 'ltr')
    expect(body).toHaveAttribute('lang', 'en')
  })

  it('keeps an Arabic reply containing the brand name, a URL, and an email rtl/ar', () => {
    const message =
      'أهلاً! أنا PRIA من PR Per Hour. يمكنك زيارة https://prperhour.com أو مراسلتنا عبر info@prperhour.com.'

    renderWithProviders(<AnasMessage message={assistantMessage(message)} reducedMotion />)

    const body = getAssistantBody()
    expect(body).toHaveAttribute('dir', 'rtl')
    expect(body).toHaveAttribute('lang', 'ar')
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://prperhour.com')
  })

  it('keeps a long Arabic response rtl/ar', () => {
    const message = Array.from({ length: 15 })
      .map(() => 'هذه فقرة طويلة تشرح خدمات الشركة المختلفة بالتفصيل. ')
      .join('')

    renderWithProviders(<AnasMessage message={assistantMessage(message)} reducedMotion />)

    expect(getAssistantBody()).toHaveAttribute('dir', 'rtl')
  })

  it('does not localize the assistant marker or timestamp to the message language', () => {
    renderWithProviders(
      <AnasMessage message={assistantMessage('مرحباً، كيف يمكنني مساعدتك؟')} reducedMotion />,
    )

    // The author marker follows the UI locale (English test i18n), not the
    // Arabic message body, and carries no message-specific dir/lang.
    const author = screen.getByText('PRIA')
    expect(author).not.toHaveAttribute('dir')
    expect(author).not.toHaveAttribute('lang')
  })

  it('applies dir/lang to a visitor bubble the same way as assistant replies', () => {
    renderWithProviders(
      <AnasMessage message={visitorMessage('مرحباً، أحتاج مساعدة بخصوص خدماتكم.')} reducedMotion />,
    )

    const bubble = getVisitorBubble()
    expect(bubble).toHaveAttribute('dir', 'rtl')
    expect(bubble).toHaveAttribute('lang', 'ar')
  })

  it('renders mixed Arabic/English content without throwing and keeps it rtl', () => {
    const message =
      'نحتاج مساعدة لاختيار الخدمة الأنسب لمشروعنا القادم، وربما نستخدم Strategic Communication كجزء من الخطة.'

    renderWithProviders(<AnasMessage message={assistantMessage(message)} reducedMotion />)

    expect(getAssistantBody()).toHaveAttribute('dir', 'rtl')
    expect(getAssistantBody()).toHaveTextContent(message)
  })

  it('renders Markdown formatting inside an rtl/ar assistant reply', () => {
    const message =
      'أنسب نقطة بداية إلك هي **Data Analysis & Business Intelligence**.\n\n' +
      '- يساعد في تحديد نقاط الانخفاض\n- يكشف الأنماط اللي تستحق المتابعة'

    renderWithProviders(<AnasMessage message={assistantMessage(message)} reducedMotion />)

    const body = getAssistantBody()
    expect(body).toHaveAttribute('dir', 'rtl')
    expect(body).toHaveAttribute('lang', 'ar')

    const strong = screen.getByText('Data Analysis & Business Intelligence')
    expect(strong.tagName).toBe('STRONG')
    expect(body.querySelector('ul')).not.toBeNull()
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('renders Markdown formatting inside an ltr/en assistant reply', () => {
    const message =
      'Start with **Data Analysis & Business Intelligence**.\n\n' +
      '1. Identify where the decline started\n2. Surface the patterns worth watching'

    renderWithProviders(<AnasMessage message={assistantMessage(message)} reducedMotion />)

    const body = getAssistantBody()
    expect(body).toHaveAttribute('dir', 'ltr')
    expect(body).toHaveAttribute('lang', 'en')

    const strong = screen.getByText('Data Analysis & Business Intelligence')
    expect(strong.tagName).toBe('STRONG')
    expect(body.querySelector('ol')).not.toBeNull()
  })
})
