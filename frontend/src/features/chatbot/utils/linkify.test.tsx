import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderMessageContent } from '@/features/chatbot/utils/linkify'

describe('renderMessageContent', () => {
  it('renders plain text with no links untouched', () => {
    render(<p>{renderMessageContent('Hello, how can I help?')}</p>)
    expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument()
  })

  it('turns an https URL into a safe anchor', () => {
    render(<p>{renderMessageContent('Visit https://prperhour.com for more.')}</p>)

    const link = screen.getByRole('link', { name: 'https://prperhour.com' })
    expect(link).toHaveAttribute('href', 'https://prperhour.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('strips trailing sentence punctuation from a detected URL', () => {
    render(<p>{renderMessageContent('See https://prperhour.com/services.')}</p>)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://prperhour.com/services')
    expect(link.nextSibling?.textContent).toBe('.')
  })

  it('normalizes a www-prefixed mention to an https link', () => {
    render(<p>{renderMessageContent('Check www.prperhour.com today')}</p>)

    const link = screen.getByRole('link', { name: 'www.prperhour.com' })
    expect(link).toHaveAttribute('href', 'https://www.prperhour.com')
  })

  it('never renders a non-http(s) scheme as a clickable link', () => {
    render(<p>{renderMessageContent('Run javascript:alert(1) please')}</p>)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
