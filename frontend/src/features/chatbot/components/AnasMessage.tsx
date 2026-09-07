import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'
import { AnasMarkdown } from '@/features/chatbot/components/AnasMarkdown'
import { renderMessageContent } from '@/features/chatbot/utils/linkify'
import { detectMessageDirection } from '@/features/chatbot/utils/messageDirection'
import { getStreamSafeMarkdown } from '@/features/chatbot/utils/streamSafeMarkdown'
import type { ChatMessageViewModel } from '@/features/chatbot/types/chatbot.types'
import { cn } from '@/shared/utils/cn'

export interface AnasMessageProps {
  message: ChatMessageViewModel
  reducedMotion: boolean
  onRetry?: () => void
}

function formatTime(createdAt: string | null, locale: string): string | null {
  if (!createdAt) return null
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return null
  }
}

/**
 * Editorial assistant treatment for Anas, a restrained navy bubble for the
 * visitor/client — deliberately not a Messenger-style bubble pair.
 */
export function AnasMessage({
  message,
  reducedMotion,
  onRetry,
}: AnasMessageProps) {
  const { t, i18n } = useTranslation('chatbot')
  const isAssistant = message.sender === 'bot' || message.sender === 'admin'
  const isStreaming = message.status === 'streaming'
  const time = formatTime(message.createdAt, i18n.language)
  const direction = detectMessageDirection(message.message)

  if (isAssistant) {
    // Only trimmed while still streaming — the final "done" text is
    // already guard-validated and shown exactly as received.
    const displayedText = isStreaming
      ? getStreamSafeMarkdown(message.message)
      : message.message

    return (
      <article
        className={cn(
          'anas-message anas-message--assistant',
          !reducedMotion && 'anas-message--enter',
        )}
      >
        <div className="anas-message__marker">
          <AnasHourglass
            size={18}
            state="idle"
            reducedMotion={reducedMotion}
          />
          <span className="anas-message__author">{t('anasLabel')}</span>
        </div>

        <div
          className="anas-message__assistant-body"
          dir={direction.dir}
          lang={direction.lang}
        >
          <AnasMarkdown content={displayedText} />
          {isStreaming ? (
            <span
              className={cn(
                'anas-message__caret',
                !reducedMotion && 'anas-message__caret--blink',
              )}
              aria-hidden="true"
            >
              ▍
            </span>
          ) : null}
        </div>

        {time ? (
          <p className="anas-message__time anas-message__time--assistant">
            {time}
          </p>
        ) : null}
      </article>
    )
  }

  return (
    <article
      className={cn(
        'anas-message anas-message--visitor',
        message.status === 'pending' && 'anas-message--pending',
        message.status === 'failed' && 'anas-message--failed',
        !reducedMotion && 'anas-message--enter',
      )}
    >
      <div
        className="anas-message__bubble"
        dir={direction.dir}
        lang={direction.lang}
      >
        {renderMessageContent(message.message)}
      </div>

      <div className="anas-message__meta">
        {time ? <span className="anas-message__time">{time}</span> : null}

        {message.status === 'failed' ? (
          <span className="anas-message__failed">
            {t('sendFailedTitle')}
            {onRetry ? (
              <button
                type="button"
                className="anas-message__retry"
                onClick={onRetry}
              >
                {t('retrySend')}
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
    </article>
  )
}
