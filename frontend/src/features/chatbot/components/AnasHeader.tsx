import type { Ref } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'

export interface AnasHeaderProps {
  titleId: string
  reducedMotion: boolean
  onClose: () => void
  closeButtonRef?: Ref<HTMLButtonElement>
}

export function AnasHeader({
  titleId,
  reducedMotion,
  onClose,
  closeButtonRef,
}: AnasHeaderProps) {
  const { t } = useTranslation('chatbot')

  return (
    <header className="anas-panel__header">
      <div className="anas-panel__header-glow" aria-hidden="true" />

      <div className="anas-panel__identity">
        <AnasHourglass
          size={34}
          state="idle"
          reducedMotion={reducedMotion}
          className="anas-panel__mark"
        />

        <div className="anas-panel__titles">
          <p id={titleId} className="anas-panel__name">
            {t('assistantName')}
          </p>
          <p className="anas-panel__role">{t('assistantRole')}</p>
          <p className="anas-panel__status">
            <span className="anas-panel__status-dot" aria-hidden="true" />
            {t('statusOnline')}
          </p>
        </div>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        className="anas-panel__close"
        onClick={onClose}
        aria-label={t('launcherCloseLabel')}
      >
        <X aria-hidden="true" size={20} />
      </button>
    </header>
  )
}
