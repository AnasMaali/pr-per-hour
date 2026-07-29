import { forwardRef, useId } from 'react'
import {
  PR_MARK_GOLD,
  PR_MARK_MASK_LEFT_STROKE_WIDTH,
  PR_MARK_MASK_STROKE_WIDTH,
  PR_MARK_PATHS,
  PR_MARK_VIEWBOX,
} from '@/assets/brand/prMarkGeometry'
import markWhiteUrl from '@/assets/brand/pr-per-hour-mark-white.png'
import { cn } from '@/shared/utils/cn'

export interface BrandMarkDrawProps {
  className?: string
  /** When true, exact filled mark is shown (reduced-motion / static). */
  complete?: boolean
}

/** Dash overshoot past pathLength=1 — hides anti-aliased start speck. */
const HIDDEN_DASH = 1.05

/**
 * Official PR mark for scroll reveal.
 *
 * White silhouette: pixel mask from LOGO.jpeg. Gold: measured SVG semicircles.
 * Invisible mask centerlines progressively uncover the white silhouette —
 * no construction strokes, no ghost overlay, no morph into a second shape.
 */
export const BrandMarkDraw = forwardRef<SVGSVGElement, BrandMarkDrawProps>(
  function BrandMarkDraw({ className, complete = false }, ref) {
    const reactId = useId().replace(/:/g, '')
    const drawMaskId = `brand-mark-draw-mask-${reactId}`
    const shapeMaskId = `brand-mark-shape-mask-${reactId}`

    return (
      <svg
        ref={ref}
        className={cn(
          'brand-mark-draw',
          complete && 'brand-mark-draw--complete',
          className,
        )}
        viewBox={PR_MARK_VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* Luminance/alpha from the original logo white pixels → themeable fill. */}
          <mask
            id={shapeMaskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="500"
            height="500"
          >
            <image
              href={markWhiteUrl}
              x="0"
              y="0"
              width="500"
              height="500"
              preserveAspectRatio="none"
            />
          </mask>

          {!complete && (
            <mask
              id={drawMaskId}
              maskUnits="userSpaceOnUse"
              x="115"
              y="85"
              width="270"
              height="340"
            >
              <rect x="115" y="85" width="270" height="340" fill="black" />
              <g
                className="brand-mark-draw__mask-strokes"
                fill="none"
                stroke="white"
                strokeWidth={PR_MARK_MASK_STROKE_WIDTH}
                strokeLinecap="butt"
                strokeLinejoin="round"
              >
                <path
                  className="brand-mark-draw__path"
                  data-draw="stem"
                  d={PR_MARK_PATHS.stem}
                  pathLength={1}
                  strokeDasharray={HIDDEN_DASH}
                  strokeDashoffset={HIDDEN_DASH}
                />
                <path
                  className="brand-mark-draw__path"
                  data-draw="white-upper"
                  d={PR_MARK_PATHS.whiteUpper}
                  pathLength={1}
                  strokeDasharray={HIDDEN_DASH}
                  strokeDashoffset={HIDDEN_DASH}
                />
                <path
                  className="brand-mark-draw__path"
                  data-draw="white-left"
                  d={PR_MARK_PATHS.whiteLeft}
                  pathLength={1}
                  strokeWidth={PR_MARK_MASK_LEFT_STROKE_WIDTH}
                  strokeDasharray={HIDDEN_DASH}
                  strokeDashoffset={HIDDEN_DASH}
                />
                <path
                  className="brand-mark-draw__path"
                  data-draw="white-lower"
                  d={PR_MARK_PATHS.whiteLower}
                  pathLength={1}
                  strokeDasharray={HIDDEN_DASH}
                  strokeDashoffset={HIDDEN_DASH}
                />
              </g>
            </mask>
          )}
        </defs>

        {/* Exact original white silhouette (theme via currentColor). */}
        <g
          className="brand-mark-draw__fill"
          data-fill-layer=""
          mask={complete ? undefined : `url(#${drawMaskId})`}
        >
          <rect
            x="115"
            y="85"
            width="270"
            height="340"
            fill="currentColor"
            mask={`url(#${shapeMaskId})`}
          />
        </g>

        {/* Exact gold fills — contour-traced from LOGO.jpeg hard-gold pixels. */}
        <g className="brand-mark-draw__gold">
          <path
            className="brand-mark-draw__sand brand-mark-draw__sand--top"
            data-gold="upper"
            d={PR_MARK_PATHS.goldUpper}
            fill={PR_MARK_GOLD}
          />
          <path
            className="brand-mark-draw__sand brand-mark-draw__sand--bottom"
            data-gold="lower"
            d={PR_MARK_PATHS.goldLower}
            fill={PR_MARK_GOLD}
          />
        </g>
      </svg>
    )
  },
)
