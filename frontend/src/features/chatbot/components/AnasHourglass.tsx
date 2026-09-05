import { forwardRef, useId } from 'react'
import { cn } from '@/shared/utils/cn'
import '@/features/chatbot/styles/anas-hourglass.css'

export type AnasHourglassState = 'idle' | 'opening' | 'thinking' | 'success'

export interface AnasHourglassProps {
  /** Rendered width/height in px (the SVG is square). */
  size?: number
  state?: AnasHourglassState
  reducedMotion?: boolean
  className?: string
}

/**
 * PR Per Hour's signature mark for Anas: a restrained, geometric hourglass
 * — the brand's "Hour" identity made literal. Reused unmodified in the
 * launcher, the panel header, and the typing indicator; only `state` and
 * `size` change.
 *
 * Kept intentionally simple (two triangles + two caps, no bulbous glass
 * curves) so it stays crisp at 20px and never reads as a cartoon icon.
 */
export const AnasHourglass = forwardRef<SVGSVGElement, AnasHourglassProps>(
  function AnasHourglass(
    { size = 32, state = 'idle', reducedMotion = false, className },
    ref,
  ) {
    const reactId = useId().replace(/:/g, '')
    const glowId = `anas-hourglass-glow-${reactId}`

    return (
      <svg
        ref={ref}
        className={cn(
          'anas-hourglass',
          `anas-hourglass--${state}`,
          reducedMotion && 'anas-hourglass--reduced',
          className,
        )}
        width={size}
        height={size}
        viewBox="0 0 100 140"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" />
          </filter>
        </defs>

        <ellipse
          className="anas-hourglass__glow"
          cx="50"
          cy="70"
          rx="34"
          ry="46"
          filter={`url(#${glowId})`}
        />

        <g className="anas-hourglass__frame">
          <line
            className="anas-hourglass__strut"
            x1="16"
            y1="15"
            x2="16"
            y2="125"
          />
          <line
            className="anas-hourglass__strut"
            x1="84"
            y1="15"
            x2="84"
            y2="125"
          />

          <rect
            className="anas-hourglass__cap"
            x="13"
            y="8"
            width="74"
            height="10"
            rx="3.5"
          />
          <rect
            className="anas-hourglass__cap"
            x="13"
            y="122"
            width="74"
            height="10"
            rx="3.5"
          />

          <g className="anas-hourglass__spin">
            <polygon
              className="anas-hourglass__glass"
              points="20,18 80,18 50,70"
            />
            <polygon
              className="anas-hourglass__glass"
              points="20,122 80,122 50,70"
            />

            <clipPath id={`${reactId}-top-clip`}>
              <polygon points="20,18 80,18 50,70" />
            </clipPath>
            <clipPath id={`${reactId}-bottom-clip`}>
              <polygon points="20,122 80,122 50,70" />
            </clipPath>

            <g clipPath={`url(#${reactId}-top-clip)`}>
              <polygon
                className="anas-hourglass__sand anas-hourglass__sand--top"
                points="26,24 74,24 50,68"
              />
            </g>

            <g clipPath={`url(#${reactId}-bottom-clip)`}>
              <polygon
                className="anas-hourglass__sand anas-hourglass__sand--bottom"
                points="26,116 74,116 50,72"
              />
            </g>

            <line
              className="anas-hourglass__stream"
              x1="50"
              y1="66"
              x2="50"
              y2="79"
            />
          </g>
        </g>
      </svg>
    )
  },
)
