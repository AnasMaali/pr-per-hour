import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { ApiClientError } from '@/shared/api/errors'
import { chatbotApi } from '@/features/chatbot/api/chatbotApi'
import {
  chatReducer,
  initialChatState,
  nextLocalMessageId,
} from '@/features/chatbot/state/chatReducer'
import {
  chatSessionStorage,
  type ChatIdentity,
} from '@/features/chatbot/state/chatSessionStorage'

function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.normalized.message
  }
  return 'network_error'
}

/**
 * Owns the full Anas conversation lifecycle: identity-aware session
 * bootstrap (create-or-restore), sending messages, retrying a failed
 * turn, and the panel open/close phase. UI components only ever read
 * `state` and call the returned actions — no fetching happens directly
 * in components.
 */
export function useChatSession() {
  const { user, isAuthenticated } = useAuth()
  const identity: ChatIdentity =
    isAuthenticated && user ? `user:${user.id}` : 'guest'

  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const identityRef = useRef(identity)

  // Never let a guest conversation continue as a different signed-in
  // user's (or a previous user's conversation survive into a new one).
  useEffect(() => {
    if (identityRef.current === identity) return
    identityRef.current = identity
    chatSessionStorage.clear()
    dispatch({ type: 'SESSION_RESET' })
  }, [identity])

  const ensureSession = useCallback(async () => {
    dispatch({ type: 'SESSION_LOADING' })

    const storedToken = chatSessionStorage.read(identity)

    try {
      if (storedToken) {
        try {
          const response = await chatbotApi.getConversation(storedToken)
          dispatch({
            type: 'SESSION_READY',
            token: storedToken,
            status: response.data.status,
            messages: response.data.messages,
          })
          return
        } catch {
          // Invalid / expired / foreign token — start fresh below.
          chatSessionStorage.clear()
        }
      }

      const response = await chatbotApi.startConversation()
      chatSessionStorage.write(identity, response.data.conversation_token)
      dispatch({
        type: 'SESSION_READY',
        token: response.data.conversation_token,
        status: response.data.status,
        messages: response.data.messages,
      })
    } catch (error) {
      dispatch({ type: 'SESSION_ERROR', message: extractErrorMessage(error) })
    }
  }, [identity])

  // Single source of truth for "when do we need a conversation": whenever
  // the panel is not closed and no session has been established yet.
  useEffect(() => {
    if (state.phase === 'closed') return
    if (state.session !== 'idle') return
    void ensureSession()
  }, [state.phase, state.session, ensureSession])

  const runSend = useCallback(
    async (localId: string, text: string, token: string) => {
      try {
        const response = await chatbotApi.sendMessage(token, text)
        dispatch({
          type: 'MESSAGE_SEND_SUCCESS',
          localId,
          userMessage: response.data.message,
          botMessage: response.data.reply,
        })
      } catch (error) {
        dispatch({
          type: 'MESSAGE_SEND_ERROR',
          localId,
          message: extractErrorMessage(error),
        })
      }
    },
    [],
  )

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (
        trimmed === '' ||
        !state.conversationToken ||
        state.send === 'pending' ||
        state.conversationStatus === 'closed'
      ) {
        return
      }

      const localId = nextLocalMessageId()
      dispatch({ type: 'MESSAGE_SEND_START', localId, text: trimmed })
      void runSend(localId, trimmed, state.conversationToken)
    },
    [state.conversationToken, state.send, state.conversationStatus, runSend],
  )

  const retryMessage = useCallback(
    (localId: string) => {
      if (!state.conversationToken || state.send === 'pending') return
      const target = state.messages.find((entry) => entry.localId === localId)
      if (!target) return

      dispatch({ type: 'MESSAGE_RETRY', localId })
      void runSend(localId, target.message, state.conversationToken)
    },
    [state.messages, state.conversationToken, state.send, runSend],
  )

  const openPanel = useCallback(() => {
    dispatch({ type: 'OPEN_REQUESTED' })
  }, [])

  const closePanel = useCallback(() => {
    dispatch({ type: 'CLOSE_REQUESTED' })
  }, [])

  const onOpenAnimationDone = useCallback(() => {
    dispatch({ type: 'OPEN_ANIMATION_DONE' })
  }, [])

  const onCloseAnimationDone = useCallback(() => {
    dispatch({ type: 'CLOSE_ANIMATION_DONE' })
  }, [])

  /** Used both to retry a failed session bootstrap and to start a fresh
   * conversation once the current one has been closed. */
  const restartSession = useCallback(() => {
    chatSessionStorage.clear()
    dispatch({ type: 'SESSION_RESET' })
  }, [])

  return {
    state,
    openPanel,
    closePanel,
    onOpenAnimationDone,
    onCloseAnimationDone,
    sendMessage,
    retryMessage,
    restartSession,
  }
}

export type UseChatSessionResult = ReturnType<typeof useChatSession>
