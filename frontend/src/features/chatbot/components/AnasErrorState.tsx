import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'

export interface AnasErrorStateProps {
  reducedMotion: boolean
  onRetry: () => void
}

/**
 * The backend is unreachable — never a stack trace or raw JSON. Anas's own
 * local fallback already covers "AI provider is down"; this state is only
 * for when the PR Per Hour API itself cannot be reached at all.
 */
export function AnasErrorState({ reducedMotion, onRetry }: AnasErrorStateProps) {
  const { t } = useTranslation(['chatbot', 'common'])

  return (
    <div className="anas-error-state" role="alert">
      <AnasHourglass
        size={44}
        state="idle"
        reducedMotion={reducedMotion}
        className="anas-error-state__mark"
      />

      <h2 className="anas-error-state__title">{t('chatbot:connectionErrorTitle')}</h2>
      <p className="anas-error-state__body">{t('chatbot:connectionErrorBody')}</p>

      <div className="anas-error-state__actions">
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          {t('common:retry')}
        </button>

        <Link className="btn" to="/contact">
          {t('chatbot:connectionErrorContact')}
        </Link>
      </div>
    </div>
  )
}
