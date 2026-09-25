import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'
import { InlineLoader } from '@/shared/components/InlineLoader'

export interface AnasPanelShellProps {
  panelId: string
  titleId: string
  reducedMotion: boolean
}

/**
 * Instant, branded placeholder shown for the one or two frames — occasionally
 * longer on a cold cache or slow network — between a visitor opening the
 * panel and the code-split AnasPanel chunk (GSAP, conversation UI, markdown
 * rendering) resolving. Rendered as the `Suspense` fallback in
 * AnasChatWidget so the launcher click always gets visible feedback within
 * a frame instead of appearing unresponsive.
 *
 * Deliberately styled with its own small, eagerly-bundled CSS (in
 * anas-widget.css) rather than reusing anas-panel.css's classes: that
 * stylesheet ships inside the same lazy chunk as AnasPanel, so borrowing
 * its classes here would risk an unstyled flash while the chunk is still
 * loading — exactly what this component exists to prevent.
 */
export function AnasPanelShell({ panelId, titleId, reducedMotion }: AnasPanelShellProps) {
  const { t } = useTranslation('chatbot')

  return (
    <div
      id={panelId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy="true"
      className="anas-panel-shell"
    >
      <div className="anas-panel-shell__header">
        <AnasHourglass
          size={34}
          state="idle"
          reducedMotion={reducedMotion}
          className="anas-panel-shell__mark"
        />

        <div className="anas-panel-shell__titles">
          <p id={titleId} className="anas-panel-shell__name">
            {t('assistantName')}
          </p>
          <p className="anas-panel-shell__role">{t('assistantRole')}</p>
        </div>
      </div>

      <div className="anas-panel-shell__body">
        <InlineLoader />
      </div>
    </div>
  )
}
