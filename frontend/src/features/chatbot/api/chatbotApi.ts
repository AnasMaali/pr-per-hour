import { apiGet, apiPost } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type {
  ChatConversationDto,
  ChatTurnDto,
  StartConversationPayload,
} from '@/features/chatbot/types/chatbot.types'

/**
 * Thin wrapper around the Laravel Chatbot REST endpoints. The frontend
 * never talks to an AI provider directly — every call goes through the
 * PR Per Hour API, which itself never leaks provider/internal details.
 */
export const chatbotApi = {
  startConversation(
    payload: StartConversationPayload = {},
  ): Promise<ApiSuccessResponse<ChatConversationDto>> {
    return apiPost<ChatConversationDto, StartConversationPayload>(
      '/chatbot/conversations',
      payload,
    )
  },

  getConversation(
    conversationToken: string,
    signal?: AbortSignal,
  ): Promise<ApiSuccessResponse<ChatConversationDto>> {
    return apiGet<ChatConversationDto>(
      `/chatbot/conversations/${encodeURIComponent(conversationToken)}`,
      { signal },
    )
  },

  sendMessage(
    conversationToken: string,
    message: string,
  ): Promise<ApiSuccessResponse<ChatTurnDto>> {
    return apiPost<ChatTurnDto, { message: string }>(
      `/chatbot/conversations/${encodeURIComponent(conversationToken)}/messages`,
      { message },
    )
  },
}
