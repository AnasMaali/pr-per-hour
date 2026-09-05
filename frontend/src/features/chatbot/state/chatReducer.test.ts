import { describe, expect, it } from 'vitest'
import {
  chatReducer,
  initialChatState,
  type ChatState,
} from '@/features/chatbot/state/chatReducer'
import type { ChatMessageDto } from '@/features/chatbot/types/chatbot.types'

function userMessage(message: string): ChatMessageDto {
  return { sender: 'visitor', message, created_at: '2026-01-01T00:00:00Z' }
}

function botMessage(message: string): ChatMessageDto {
  return { sender: 'bot', message, created_at: '2026-01-01T00:00:01Z' }
}

describe('chatReducer', () => {
  it('moves through the open/close phase lifecycle without touching conversation state', () => {
    let state = chatReducer(initialChatState, { type: 'OPEN_REQUESTED' })
    expect(state.phase).toBe('opening')

    state = chatReducer(state, { type: 'OPEN_ANIMATION_DONE' })
    expect(state.phase).toBe('open')

    state = chatReducer(state, { type: 'CLOSE_REQUESTED' })
    expect(state.phase).toBe('closing')

    state = chatReducer(state, { type: 'CLOSE_ANIMATION_DONE' })
    expect(state.phase).toBe('closed')
  })

  it('ignores OPEN_ANIMATION_DONE unless currently opening', () => {
    const state = chatReducer(initialChatState, { type: 'OPEN_ANIMATION_DONE' })
    expect(state.phase).toBe('closed')
  })

  it('loads a restored conversation into view models', () => {
    const state = chatReducer(initialChatState, {
      type: 'SESSION_READY',
      token: 'tok-1',
      status: 'open',
      messages: [userMessage('Hello'), botMessage('Hi there')],
    })

    expect(state.session).toBe('ready')
    expect(state.conversationToken).toBe('tok-1')
    expect(state.messages).toHaveLength(2)
    expect(state.messages[0]?.sender).toBe('visitor')
    expect(state.messages[1]?.sender).toBe('bot')
    // Never a database ID — only a locally-generated key.
    expect(state.messages[0]?.localId).not.toMatch(/^\d+$/)
  })

  it('records a session bootstrap failure', () => {
    const state = chatReducer(initialChatState, {
      type: 'SESSION_ERROR',
      message: 'network_error',
    })
    expect(state.session).toBe('error')
    expect(state.sessionError).toBe('network_error')
  })

  it('appends an optimistic message on send start', () => {
    const state = chatReducer(initialChatState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-1',
      text: 'What services do you offer?',
    })

    expect(state.send).toBe('pending')
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0]).toMatchObject({
      localId: 'local-1',
      sender: 'visitor',
      status: 'pending',
    })
  })

  it('reconciles the optimistic message and appends the bot reply on success', () => {
    let state = chatReducer(initialChatState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-1',
      text: 'What services do you offer?',
    })

    state = chatReducer(state, {
      type: 'MESSAGE_SEND_SUCCESS',
      localId: 'local-1',
      userMessage: userMessage('What services do you offer?'),
      botMessage: botMessage('Here is how PR Per Hour can help.'),
    })

    expect(state.send).toBe('idle')
    expect(state.messages).toHaveLength(2)
    expect(state.messages[0]).toMatchObject({
      localId: 'local-1',
      status: 'sent',
    })
    expect(state.messages[1]).toMatchObject({
      sender: 'bot',
      status: 'sent',
    })
  })

  it('marks the optimistic message failed on error, keeping it in the transcript', () => {
    let state = chatReducer(initialChatState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-1',
      text: 'Hello?',
    })

    state = chatReducer(state, {
      type: 'MESSAGE_SEND_ERROR',
      localId: 'local-1',
      message: 'network_error',
    })

    expect(state.send).toBe('error')
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0]?.status).toBe('failed')
  })

  it('increments unread only when a reply resolves while the panel is not open', () => {
    const openState: ChatState = { ...initialChatState, phase: 'open' }
    let state = chatReducer(openState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-1',
      text: 'Hello?',
    })
    state = chatReducer(state, {
      type: 'MESSAGE_SEND_SUCCESS',
      localId: 'local-1',
      userMessage: userMessage('Hello?'),
      botMessage: botMessage('Hi!'),
    })
    expect(state.unread).toBe(0)

    const closedState: ChatState = { ...initialChatState, phase: 'closing' }
    let closing = chatReducer(closedState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-2',
      text: 'Hello again?',
    })
    closing = chatReducer(closing, {
      type: 'MESSAGE_SEND_SUCCESS',
      localId: 'local-2',
      userMessage: userMessage('Hello again?'),
      botMessage: botMessage('Still here!'),
    })
    expect(closing.unread).toBe(1)
  })

  it('resets the conversation but preserves the current panel phase', () => {
    const state: ChatState = {
      ...initialChatState,
      phase: 'open',
      session: 'ready',
      conversationToken: 'tok-1',
      messages: [
        {
          localId: 'a',
          sender: 'visitor',
          message: 'hi',
          createdAt: null,
          status: 'sent',
        },
      ],
    }

    const reset = chatReducer(state, { type: 'SESSION_RESET' })

    expect(reset.phase).toBe('open')
    expect(reset.session).toBe('idle')
    expect(reset.conversationToken).toBeNull()
    expect(reset.messages).toHaveLength(0)
  })

  it('re-marks a failed message pending on retry without duplicating it', () => {
    let state = chatReducer(initialChatState, {
      type: 'MESSAGE_SEND_START',
      localId: 'local-1',
      text: 'Hello?',
    })
    state = chatReducer(state, {
      type: 'MESSAGE_SEND_ERROR',
      localId: 'local-1',
      message: 'network_error',
    })

    state = chatReducer(state, { type: 'MESSAGE_RETRY', localId: 'local-1' })

    expect(state.send).toBe('pending')
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0]?.status).toBe('pending')
  })
})
