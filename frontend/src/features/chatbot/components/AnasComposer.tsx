import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp } from 'lucide-react'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/features/chatbot/types/chatbot.types'
import { cn } from '@/shared/utils/cn'

export interface AnasComposerProps {
  disabled: boolean
  onSend: (text: string) => void
}

const MAX_TEXTAREA_HEIGHT_PX = 132
const COUNTER_THRESHOLD = 120

export function AnasComposer({ disabled, onSend }: AnasComposerProps) {
  const { t } = useTranslation('chatbot')
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`
  }, [value])

  function submit() {
    const trimmed = value.trim()
    if (trimmed === '' || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const remaining = CHAT_MESSAGE_MAX_LENGTH - value.length
  const showCounter = remaining <= COUNTER_THRESHOLD
  const canSend = value.trim() !== '' && !disabled

  return (
    <form className="anas-composer" onSubmit={handleSubmit}>
      <div className="anas-composer__field">
        <label htmlFor="anas-composer-textarea" className="visually-hidden">
          {t('composerLabel')}
        </label>

        <textarea
          id="anas-composer-textarea"
          ref={textareaRef}
          className="anas-composer__textarea"
          value={value}
          disabled={disabled}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          rows={1}
          placeholder={t('composerPlaceholder')}
          enterKeyHint="send"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className="anas-composer__send"
          disabled={!canSend}
          aria-label={t('composerSend')}
        >
          <ArrowUp aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="anas-composer__footer">
        <span className="anas-composer__hint">{t('composerHint')}</span>

        {showCounter ? (
          <span
            className={cn(
              'anas-composer__counter',
              remaining < 0 && 'anas-composer__counter--over',
            )}
          >
            {t('composerCounter', {
              count: value.length,
              max: CHAT_MESSAGE_MAX_LENGTH,
            })}
          </span>
        ) : null}
      </div>
    </form>
  )
}
