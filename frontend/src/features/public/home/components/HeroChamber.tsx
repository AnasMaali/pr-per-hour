import brandMarkUrl from '@/assets/brand/pr-per-hour-mark-card.svg'
import { cn } from '@/shared/utils/cn'
import { usePointerParallax } from '@/shared/motion/hooks/usePointerParallax'
import { useReducedMotion } from '@/shared/motion/hooks/useReducedMotion'

/**
 * Minimal premium logo mark — floating badge only.
 * Soft glow + shadow; no decorative scene behind the mark.
 */
export function HeroChamber() {
  const reduced = useReducedMotion()
  const stageRef = usePointerParallax<HTMLDivElement>({ intensity: 7 })

  return (
    <div
      ref={stageRef}
      className={cn('hero-mark', reduced && 'hero-mark--static')}
      aria-hidden="true"
    >
      <div className="hero-mark__glow" />
      <div className="hero-mark__shadow" />
      <div className="hero-mark__tilt">
        <div className="hero-mark__core" data-layer="core">
          <div className="hero-mark__badge">
            <div className="hero-mark__shine" />
            <img
              className="hero-mark__img"
              src={brandMarkUrl}
              alt=""
              width={270}
              height={340}
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
