import { forwardRef, useState, type PointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AnasHourglass } from '@/features/chatbot/components/AnasHourglass'
import { cn } from '@/shared/utils/cn'
import '@/features/chatbot/styles/anas-launcher.css'

export interface AnasLauncherProps {
  panelId: string
  hidden: boolean
  unreadCount: number
  reducedMotion: boolean
  onOpen: () => void
  /**
   * Starts fetching the code-split AnasPanel chunk ahead of the actual
   * click, so opening feels instant. Wired to every signal that a visitor
   * is about to open the panel: hover, keyboard focus, and the earliest
   * possible pointer/touch event before the click itself fires. Safe to
   * call repeatedly — the underlying dynamic import is memoized.
   */
  onPreload: () => void
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * The closed-state entry point: a floating navy/gold launcher with a
 * restrained idle float, a hover tilt + magnetic pointer response, and an
 * animated hourglass in place of a generic chat bubble icon.
 */
export const AnasLauncher = forwardRef<HTMLButtonElement, AnasLauncherProps>(
  function AnasLauncher(
    { panelId, hidden, unreadCount, reducedMotion, onOpen, onPreload },
    ref,
  ) {
    const { t } = useTranslation('chatbot')
    const [hovered, setHovered] = useState(false)
    const [magnet, setMagnet] = useState({ x: 0, y: 0 })

    function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
      if (reducedMotion || event.pointerType === 'touch') return
      const rect = event.currentTarget.getBoundingClientRect()
      const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      setMagnet({ x: clamp(relX, -1, 1) * 5, y: clamp(relY, -1, 1) * 4 })
    }

    function resetPointer() {
      setHovered(false)
      setMagnet({ x: 0, y: 0 })
    }

    const buttonTransform = reducedMotion
      ? undefined
      : `translate3d(${magnet.x}px, ${magnet.y}px, 0) rotate(${hovered ? -3 : 0}deg) scale(${hovered ? 1.045 : 1})`

    return (
      <div
        className={cn(
          'anas-launcher-orbit',
          reducedMotion && 'anas-launcher-orbit--reduced',
        )}
        aria-hidden={hidden || undefined}
        inert={hidden || undefined}
      >
        {unreadCount > 0 ? (
          <span
            key={unreadCount}
            className="anas-launcher__halo"
            aria-hidden="true"
          />
        ) : null}

        <button
          ref={ref}
          type="button"
          className="anas-launcher"
          style={{ transform: buttonTransform }}
          tabIndex={hidden ? -1 : 0}
          aria-label={t('launcherOpenLabel')}
          aria-haspopup="dialog"
          aria-controls={panelId}
          onClick={onOpen}
          onPointerEnter={() => {
            setHovered(true)
            onPreload()
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
          onBlur={resetPointer}
          onFocus={onPreload}
          onPointerDown={onPreload}
          onTouchStart={onPreload}
        >
          <AnasHourglass
            size={30}
            state="idle"
            reducedMotion={reducedMotion}
            className="anas-launcher__glass"
          />

          <span className="anas-launcher__label">{t('assistantName')}</span>

          {unreadCount > 0 ? (
            <span className="anas-launcher__badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </div>
    )
  },
)
