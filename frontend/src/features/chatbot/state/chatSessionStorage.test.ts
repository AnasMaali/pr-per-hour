import { beforeEach, describe, expect, it } from 'vitest'
import { chatSessionStorage } from '@/features/chatbot/state/chatSessionStorage'

describe('chatSessionStorage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('returns null when nothing is stored', () => {
    expect(chatSessionStorage.read('guest')).toBeNull()
  })

  it('round-trips a token for the same identity', () => {
    chatSessionStorage.write('guest', 'token-abc')
    expect(chatSessionStorage.read('guest')).toBe('token-abc')
  })

  it('never returns a token stored for a different identity', () => {
    chatSessionStorage.write('guest', 'guest-token')
    expect(chatSessionStorage.read('user:1')).toBeNull()

    chatSessionStorage.write('user:1', 'client-token')
    expect(chatSessionStorage.read('guest')).toBeNull()
    expect(chatSessionStorage.read('user:2')).toBeNull()
    expect(chatSessionStorage.read('user:1')).toBe('client-token')
  })

  it('clears the stored session', () => {
    chatSessionStorage.write('guest', 'guest-token')
    chatSessionStorage.clear()
    expect(chatSessionStorage.read('guest')).toBeNull()
  })

  it('ignores malformed storage content', () => {
    window.sessionStorage.setItem('prph.chatbot.session', 'not-json')
    expect(chatSessionStorage.read('guest')).toBeNull()
  })
})
