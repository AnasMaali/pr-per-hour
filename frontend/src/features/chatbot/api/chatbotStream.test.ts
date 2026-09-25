import { afterEach, describe, expect, it, vi } from 'vitest'
import { streamChatMessage } from '@/features/chatbot/api/chatbotStream'

vi.mock('@/shared/config/env', () => ({
  env: { apiBaseUrl: 'http://test.local/api/v1' },
}))

vi.mock('@/shared/i18n', () => ({
  getCurrentLocale: () => 'en',
}))

vi.mock('@/shared/lib/tokenStorage', () => ({
  tokenStorage: { get: () => null },
}))

function sseResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(stream, { status })
}

describe('streamChatMessage', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('parses start, delta, and done events in order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      sseResponse([
        'event: start\ndata: {}\n\n',
        'event: delta\ndata: {"content":"Hello"}\n\n',
        'event: delta\ndata: {"content":" world."}\n\n',
        'event: done\ndata: {"message":{"sender":"bot","message":"Hello world.","created_at":"2026-01-01T00:00:00Z"}}\n\n',
      ]),
    )

    const onDelta = vi.fn()
    const onDone = vi.fn()
    const onError = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta, onDone, onError })

    expect(onDelta.mock.calls).toEqual([['Hello'], [' world.']])
    expect(onDone).toHaveBeenCalledWith({
      sender: 'bot',
      message: 'Hello world.',
      created_at: '2026-01-01T00:00:00Z',
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('reassembles an event split across two chunk boundaries', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      sseResponse([
        'event: delta\ndata: {"content":"Hel',
        'lo"}\n\n',
        'event: done\ndata: {"message":{"sender":"bot","message":"Hello","created_at":null}}\n\n',
      ]),
    )

    const onDelta = vi.fn()
    const onDone = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta, onDone, onError: vi.fn() })

    expect(onDelta).toHaveBeenCalledWith('Hello')
    expect(onDone).toHaveBeenCalledWith({
      sender: 'bot',
      message: 'Hello',
      created_at: null,
    })
  })

  it('calls onError when the HTTP response is not ok, without calling onDone', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(sseResponse([], 500))

    const onError = vi.fn()
    const onDone = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta: vi.fn(), onDone, onError })

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
  })

  it('calls onError when fetch itself rejects', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'))

    const onError = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta: vi.fn(), onDone: vi.fn(), onError })

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('does not call onError when the request was aborted', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new DOMException('aborted', 'AbortError'))

    const onError = vi.fn()
    const controller = new AbortController()

    await streamChatMessage(
      'token-1',
      'Hi',
      { onDelta: vi.fn(), onDone: vi.fn(), onError },
      controller.signal,
    )

    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError if the connection closes without ever sending a done event', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      sseResponse(['event: delta\ndata: {"content":"Hi"}\n\n']),
    )

    const onError = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta: vi.fn(), onDone: vi.fn(), onError })

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('treats an "error" event as terminal and does not also report a missing-done error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(sseResponse(['event: error\ndata: {}\n\n']))

    const onError = vi.fn()

    await streamChatMessage('token-1', 'Hi', { onDelta: vi.fn(), onDone: vi.fn(), onError })

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('sends the message body and Accept header for an SSE request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse(['event: done\ndata: {"message":{"sender":"bot","message":"Hi","created_at":null}}\n\n']),
    )
    globalThis.fetch = fetchMock

    await streamChatMessage('token-1', 'Hello there', {
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]

    expect(url).toBe('http://test.local/api/v1/chatbot/conversations/token-1/messages/stream')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ message: 'Hello there' })
    expect((init.headers as Record<string, string>).Accept).toBe('text/event-stream')
  })
})
