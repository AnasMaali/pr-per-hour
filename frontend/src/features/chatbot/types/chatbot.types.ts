/** Mirrors SendChatMessageRequest::MESSAGE_MAX_LENGTH on the backend. */
export const CHAT_MESSAGE_MAX_LENGTH = 2000

/**
 * Wire types matching the Laravel Chatbot API contract exactly.
 * See backend/app/Features/Chatbot/Resources — no database IDs, no
 * provider metadata are ever present on these shapes.
 */
export type ChatMessageSender = 'visitor' | 'client' | 'bot' | 'admin'

export type ChatConversationStatus = 'open' | 'closed'

export interface ChatMessageDto {
  sender: ChatMessageSender
  message: string
  created_at: string | null
}

export interface ChatConversationDto {
  conversation_token: string
  status: ChatConversationStatus
  visitor_name: string | null
  messages: ChatMessageDto[]
  created_at: string | null
  updated_at: string | null
}

export interface ChatTurnDto {
  message: ChatMessageDto
  reply: ChatMessageDto
}

export interface StartConversationPayload {
  visitor_name?: string
  visitor_email?: string
}

/**
 * Client-side view model. A message rendered in the transcript, whether it
 * is confirmed by the server or still an optimistic local echo.
 */
export type ChatMessageDeliveryStatus = 'sent' | 'pending' | 'failed'

export interface ChatMessageViewModel {
  /** Stable React key; never a database ID. */
  localId: string
  sender: ChatMessageSender
  message: string
  createdAt: string | null
  status: ChatMessageDeliveryStatus
}
