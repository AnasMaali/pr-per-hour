import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/renderWithProviders'
import { AnasComposer } from '@/features/chatbot/components/AnasComposer'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/features/chatbot/types/chatbot.types'

function getTextarea(): HTMLTextAreaElement {
  return screen.getByLabelText('Message PRIA AI') as HTMLTextAreaElement
}

describe('AnasComposer', () => {
  it('sends the trimmed message on Enter and clears the field', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithProviders(<AnasComposer disabled={false} onSend={onSend} />)

    await user.type(getTextarea(), '  Hello Anas  ')
    await user.keyboard('{Enter}')

    expect(onSend).toHaveBeenCalledWith('Hello Anas')
    expect(getTextarea().value).toBe('')
  })

  it('inserts a newline on Shift+Enter instead of sending', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithProviders(<AnasComposer disabled={false} onSend={onSend} />)

    await user.type(getTextarea(), 'Line one')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(getTextarea(), 'Line two')

    expect(onSend).not.toHaveBeenCalled()
    expect(getTextarea().value).toBe('Line one\nLine two')
  })

  it('never sends an empty or whitespace-only message', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    renderWithProviders(<AnasComposer disabled={false} onSend={onSend} />)

    await user.type(getTextarea(), '   ')
    await user.keyboard('{Enter}')

    expect(onSend).not.toHaveBeenCalled()
  })

  it('disables the textarea and send button while sending', () => {
    renderWithProviders(<AnasComposer disabled onSend={vi.fn()} />)

    expect(getTextarea()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('keeps the send button disabled until there is text to send', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AnasComposer disabled={false} onSend={vi.fn()} />)

    const sendButton = screen.getByRole('button', { name: 'Send message' })
    expect(sendButton).toBeDisabled()

    await user.type(getTextarea(), 'Hi')
    expect(sendButton).toBeEnabled()
  })

  it('enforces the backend message length limit natively', () => {
    renderWithProviders(<AnasComposer disabled={false} onSend={vi.fn()} />)
    expect(getTextarea()).toHaveAttribute(
      'maxlength',
      String(CHAT_MESSAGE_MAX_LENGTH),
    )
  })

  it('only shows the character counter near the limit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AnasComposer disabled={false} onSend={vi.fn()} />)

    await user.type(getTextarea(), 'A short message')
    expect(screen.queryByText(/\/ 2000/)).not.toBeInTheDocument()

    await user.paste('B'.repeat(CHAT_MESSAGE_MAX_LENGTH - 50))
    expect(screen.getByText(/\/ 2000/)).toBeInTheDocument()
  })
})
