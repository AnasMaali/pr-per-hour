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

    default:
      return state
  }
}
