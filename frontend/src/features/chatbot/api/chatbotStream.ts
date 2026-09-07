import { env } from '@/shared/config/env'
import { getCurrentLocale } from '@/shared/i18n'
import { tokenStorage } from '@/shared/lib/tokenStorage'
import type { ChatMessageDto } from '@/features/chatbot/types/chatbot.types'

export interface ChatStreamHandlers {
  /** A new safe text fragment to append to the growing assistant message. */
  onDelta: (content: string) => void
  /** The stream finished: this is the authoritative, final persisted message. */
  onDone: (message: ChatMessageDto) => void
  /** Something went wrong — render the existing non-technical error state. */
  onError: () => void
}

interface DeltaPayload {
  content: string
}

interface DonePayload {
  message: ChatMessageDto
}

function isDeltaPayload(value: unknown): value is DeltaPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { content?: unknown }).content === 'string'
  )
}

function isDonePayload(value: unknown): value is DonePayload {
  if (typeof value !== 'object' || value === null) return false
  const message = (value as { message?: unknown }).message
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof (message as { sender?: unknown }).sender === 'string' &&
    typeof (message as { message?: unknown }).message === 'string'
  )
}

/**
 * Consumes the chatbot's Server-Sent Events stream via fetch()+ReadableStream
 * rather than the native EventSource (which cannot send a POST body or a
 * custom Authorization header — both required here). This is the standard
 * approach for POST-based SSE from a browser.
 *
 * The backend guarantees exactly one upstream AI call per turn and already
 * runs every visible chunk through its deterministic safety guard — this
 * function only parses the wire protocol, it does not re-validate content.
 */
export async function streamChatMessage(
  conversationToken: string,
  message: string,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${env.apiBaseUrl}/chatbot/conversations/${encodeURIComponent(conversationToken)}/messages/stream`

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    'X-Locale': getCurrentLocale(),
  }

  const token = tokenStorage.get()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
      signal,
    })
  } catch (error) {
    if (isAbortError(error)) return
    handlers.onError()
    return
  }

  if (!response.ok || response.body === null) {
    handlers.onError()
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let sawDone = false

  try {
    while (true) {
      const { value, done } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      let separatorIndex: number
      while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex)
        buffer = buffer.slice(separatorIndex + 2)

        if (dispatchEvent(rawEvent, handlers)) {
          sawDone = true
        }
      }
    }
  } catch (error) {
    if (isAbortError(error)) return
    if (!sawDone) handlers.onError()
    return
  }

  if (!sawDone) {
    // The connection closed cleanly but no "done" event ever arrived —
    // treat it the same as any other failure rather than leaving the
    // conversation stuck in a pending state.
    handlers.onError()
  }
}

/** Returns true if the event was "done". */
function dispatchEvent(rawEvent: string, handlers: ChatStreamHandlers): boolean {
  let eventName: string | null = null
  let dataLine: string | null = null

  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      dataLine = line.slice('data:'.length).trim()
    }
  }

  if (eventName === null || dataLine === null || dataLine === '') {
    return false
  }

  let data: unknown
  try {
    data = JSON.parse(dataLine)
  } catch {
    return false
  }

  switch (eventName) {
    case 'delta':
      if (isDeltaPayload(data)) handlers.onDelta(data.content)
      return false
    case 'done':
      if (isDonePayload(data)) handlers.onDone(data.message)
      return true
    case 'error':
      handlers.onError()
      return true
    default:
      return false
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}
