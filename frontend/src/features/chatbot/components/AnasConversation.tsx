import { useTranslation } from 'react-i18next'
import { ArrowDown } from 'lucide-react'
import { AnasMessage } from '@/features/chatbot/components/AnasMessage'
import { AnasTypingIndicator } from '@/features/chatbot/components/AnasTypingIndicator'
import { useSmartScroll } from '@/features/chatbot/hooks/useSmartScroll'
import type { ChatMessageViewModel } from '@/features/chatbot/types/chatbot.types'
import type { ChatSendStatus } from '@/features/chatbot/state/chatReducer'

export interface AnasConversationProps {
  messages: ChatMessageViewModel[]
  sendStatus: ChatSendStatus
  reducedMotion: boolean
  onRetry: (localId: string) => void
}

export function AnasConversation({
  messages,
  sendStatus,
  reducedMotion,
  onRetry,
}: AnasConversationProps) {
  const { t } = useTranslation('chatbot')
  const { containerRef, hasNewBelow, scrollToBottom } = useSmartScroll<HTMLDivElement>(
    `${messages.length}:${sendStatus}`,
  )

  return (
    <div className="anas-conversation">
      <div
        ref={containerRef}
        className="anas-conversation__scroll"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((message) => (
          <AnasMessage
            key={message.localId}
            message={message}
            reducedMotion={reducedMotion}
            onRetry={
              message.status === 'failed'
                ? () => onRetry(message.localId)
                : undefined
            }
          />
        ))}

        {sendStatus === 'pending' ? (
          <AnasTypingIndicator reducedMotion={reducedMotion} />
        ) : null}
      </div>

      {hasNewBelow ? (
        <button
          type="button"
          className="anas-conversation__jump"
          onClick={() => scrollToBottom('smooth')}
        >
          <ArrowDown aria-hidden="true" size={14} />
          {t('newMessage')}
        </button>
      ) : null}
    </div>
  )
}
