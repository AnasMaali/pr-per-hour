import type {
  ChatConversationStatus,
  ChatMessageDto,
  ChatMessageViewModel,
} from '@/features/chatbot/types/chatbot.types'

/** Panel chrome — independent of conversation content. */
export type ChatPhase = 'closed' | 'opening' | 'open' | 'closing'

/** Initial conversation bootstrap (create-or-restore). */
export type ChatSessionStatus = 'idle' | 'loading' | 'ready' | 'error'

/** A single in-flight send/receive turn. */
export type ChatSendStatus = 'idle' | 'pending' | 'error'

export interface ChatState {
  phase: ChatPhase
  session: ChatSessionStatus
  sessionError: string | null
  send: ChatSendStatus
  sendError: string | null
  conversationToken: string | null
  conversationStatus: ChatConversationStatus
  messages: ChatMessageViewModel[]
  /** Bot replies that resolved while the panel was closed/closing. */
  unread: number
}

export const initialChatState: ChatState = {
  phase: 'closed',
  session: 'idle',
  sessionError: null,
  send: 'idle',
  sendError: null,
  conversationToken: null,
  conversationStatus: 'open',
  messages: [],
  unread: 0,
}

export type ChatAction =
  | { type: 'OPEN_REQUESTED' }
  | { type: 'OPEN_ANIMATION_DONE' }
  | { type: 'CLOSE_REQUESTED' }
  | { type: 'CLOSE_ANIMATION_DONE' }
  | { type: 'SESSION_LOADING' }
  | {
      type: 'SESSION_READY'
      token: string
      status: ChatConversationStatus
      messages: ChatMessageDto[]
    }
  | { type: 'SESSION_ERROR'; message: string }
  | { type: 'SESSION_RESET' }
  | { type: 'MESSAGE_SEND_START'; localId: string; text: string }
  | {
      type: 'MESSAGE_SEND_SUCCESS'
      localId: string
      userMessage: ChatMessageDto
      botMessage: ChatMessageDto
    }
  | { type: 'MESSAGE_SEND_ERROR'; localId: string; message: string }
  | { type: 'MESSAGE_RETRY'; localId: string }
  | {
      type: 'MESSAGE_STREAM_DELTA'
      userLocalId: string
      assistantLocalId: string
      content: string
    }
  | {
      type: 'MESSAGE_STREAM_DONE'
      userLocalId: string
      assistantLocalId: string
      finalMessage: ChatMessageDto
    }
  | {
      type: 'MESSAGE_STREAM_ERROR'
      userLocalId: string
      assistantLocalId: string
      message: string
    }

function toViewModel(
  dto: ChatMessageDto,
  localId: string,
  status: ChatMessageViewModel['status'] = 'sent',
): ChatMessageViewModel {
  return {
    localId,
    sender: dto.sender,
    message: dto.message,
    createdAt: dto.created_at,
    status,
  }
}

let localIdCounter = 0

/** Stable, non-database identifier for optimistic (and DTO-derived) messages. */
export function nextLocalMessageId(): string {
  localIdCounter += 1
  return `local-${Date.now()}-${localIdCounter}`
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_REQUESTED':
      return { ...state, phase: 'opening', unread: 0 }

    case 'OPEN_ANIMATION_DONE':
      return state.phase === 'opening' ? { ...state, phase: 'open' } : state

    case 'CLOSE_REQUESTED':
      return state.phase === 'open' || state.phase === 'opening'
        ? { ...state, phase: 'closing' }
        : state

    case 'CLOSE_ANIMATION_DONE':
      return state.phase === 'closing' ? { ...state, phase: 'closed' } : state

    case 'SESSION_LOADING':
      return { ...state, session: 'loading', sessionError: null }

    case 'SESSION_READY':
      return {
        ...state,
        session: 'ready',
        sessionError: null,
        conversationToken: action.token,
        conversationStatus: action.status,
        messages: action.messages.map((dto) =>
          toViewModel(dto, nextLocalMessageId()),
        ),
      }

    case 'SESSION_ERROR':
      return {
        ...state,
        session: 'error',
        sessionError: action.message,
      }

    case 'SESSION_RESET':
      return {
        ...initialChatState,
        phase: state.phase,
      }

    case 'MESSAGE_SEND_START':
      return {
        ...state,
        send: 'pending',
        sendError: null,
        messages: [
          ...state.messages,
          {
            localId: action.localId,
            sender: 'visitor',
            message: action.text,
            createdAt: null,
            status: 'pending',
          },
        ],
      }

    case 'MESSAGE_SEND_SUCCESS': {
      const messages = state.messages.map((entry) =>
        entry.localId === action.localId
          ? toViewModel(action.userMessage, entry.localId, 'sent')
          : entry,
      )
      messages.push(
        toViewModel(action.botMessage, nextLocalMessageId(), 'sent'),
      )

      const closing = state.phase === 'closed' || state.phase === 'closing'

      return {
        ...state,
        send: 'idle',
        sendError: null,
        messages,
        unread: closing ? state.unread + 1 : state.unread,
      }
    }

    case 'MESSAGE_SEND_ERROR':
      return {
        ...state,
        send: 'error',
        sendError: action.message,
        messages: state.messages.map((entry) =>
          entry.localId === action.localId
            ? { ...entry, status: 'failed' }
            : entry,
        ),
      }

    case 'MESSAGE_RETRY':
      return {
        ...state,
        send: 'pending',
        sendError: null,
        messages: state.messages.map((entry) =>
          entry.localId === action.localId
            ? { ...entry, status: 'pending' }
            : entry,
        ),
      }

    // A safe text fragment arrived. The growing assistant message is
    // created lazily on its *first* fragment — not on MESSAGE_SEND_START —
    // so the thinking indicator stays visible until real content exists,
    // matching the "thinking -> first chunk -> message appears" UX.
    case 'MESSAGE_STREAM_DELTA': {
      const index = state.messages.findIndex(
        (entry) => entry.localId === action.assistantLocalId,
      )

      if (index === -1) {
        return {
          ...state,
          messages: [
            ...state.messages,
            {
              localId: action.assistantLocalId,
              sender: 'bot',
              message: action.content,
              createdAt: null,
              status: 'streaming',
            },
          ],
        }
      }

      const messages = state.messages.slice()
      messages[index] = {
        ...messages[index]!,
        message: messages[index]!.message + action.content,
      }

      return { ...state, messages }
    }

    // Authoritative completion: the assistant message's content is
    // *replaced* with finalMessage.message (not appended to), since the
    // backend's final quality pass can differ slightly from the raw
    // concatenation of streamed deltas — see HandleStreamingChatTurn. If
    // no delta ever created the assistant message (e.g. an immediate
    // local-fallback reply with no incremental deltas), it's created here.
    case 'MESSAGE_STREAM_DONE': {
      let sawAssistantMessage = false

      const messages = state.messages.map((entry) => {
        if (entry.localId === action.userLocalId) {
          return { ...entry, status: 'sent' as const }
        }
        if (entry.localId === action.assistantLocalId) {
          sawAssistantMessage = true
          return toViewModel(action.finalMessage, action.assistantLocalId, 'sent')
        }
        return entry
      })

      const finalMessages = sawAssistantMessage
        ? messages
        : [...messages, toViewModel(action.finalMessage, action.assistantLocalId, 'sent')]

      const closing = state.phase === 'closed' || state.phase === 'closing'

      return {
        ...state,
        send: 'idle',
        sendError: null,
        messages: finalMessages,
        unread: closing ? state.unread + 1 : state.unread,
      }
    }

    case 'MESSAGE_STREAM_ERROR':
      return {
        ...state,
        send: 'error',
        sendError: action.message,
        // Drop any partial streaming bubble — there is no authoritative
        // final text for it, so it can't be left in a permanent
        // "streaming" state. The visitor message is marked failed so the
        // existing retry affordance picks it up, exactly like a
        // non-streaming send failure.
        messages: state.messages
          .filter((entry) => entry.localId !== action.assistantLocalId)
          .map((entry) =>
            entry.localId === action.userLocalId
              ? { ...entry, status: 'failed' }
              : entry,
          ),
      }

    default:
      return state
  }
}
