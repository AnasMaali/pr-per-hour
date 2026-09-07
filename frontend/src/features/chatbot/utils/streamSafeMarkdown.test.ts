import { describe, expect, it } from 'vitest'
import { getStreamSafeMarkdown } from '@/features/chatbot/utils/streamSafeMarkdown'

describe('getStreamSafeMarkdown', () => {
  it('returns balanced plain text unchanged', () => {
    expect(getStreamSafeMarkdown('Hello, how can I help?')).toBe(
      'Hello, how can I help?',
    )
  })

  it('returns text with a complete bold span unchanged', () => {
    const text = 'The best fit is **Data Analysis & Business Intelligence** for you.'
    expect(getStreamSafeMarkdown(text)).toBe(text)
  })

  it('trims back to before an unclosed bold span', () => {
    const text = 'The best fit is **Data Analysis'
    expect(getStreamSafeMarkdown(text)).toBe('The best fit is')
  })

  it('trims back to before an unresolved markdown link', () => {
    const text = 'Visit [our site'
    expect(getStreamSafeMarkdown(text)).toBe('Visit')
  })

  it('returns text with a complete markdown link unchanged', () => {
    const text = 'Visit [our site](https://prperhour.com) today.'
    expect(getStreamSafeMarkdown(text)).toBe(text)
  })

  it('falls back to showing the text as-is when there is no safe word boundary to back off to', () => {
    // A single unbroken token with no space anywhere to retreat to.
    const text = '**incomplete'
    expect(getStreamSafeMarkdown(text)).toBe(text)
  })

  it('backs off word-by-word, never mid-word, until balance is restored', () => {
    const text = 'Intro sentence. **Bold start without'
    const result = getStreamSafeMarkdown(text)

    expect(text.startsWith(result)).toBe(true)
    expect(result).toBe('Intro sentence.')
  })
})
