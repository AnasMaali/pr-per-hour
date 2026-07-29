import { gsap } from '@/shared/motion/gsap/registerGsap'

/** Must match BrandMarkDraw hidden dash (pathLength=1 overshoot). */
export const BRAND_MARK_HIDDEN_DASH = 1.05

type GsapInstance = typeof gsap

type DrawExtras = {
  glow?: HTMLElement | null
  stage?: HTMLElement | null
}

/**
 * Animate dash via SVG attributes (unitless) so pathLength=1 stays correct.
 * Never use GSAP CSS strokeDash* — it appends "px" and breaks the mask.
 */
function hideMaskStroke(path: SVGPathElement | null) {
  if (!path) return
  path.setAttribute('stroke-dasharray', String(BRAND_MARK_HIDDEN_DASH))
  path.setAttribute('stroke-dashoffset', String(BRAND_MARK_HIDDEN_DASH))
  path.style.removeProperty('stroke-dasharray')
  path.style.removeProperty('stroke-dashoffset')
}

function queryDrawParts(svg: SVGSVGElement) {
  return {
    stem: svg.querySelector<SVGPathElement>('[data-draw="stem"]'),
    whiteUpper: svg.querySelector<SVGPathElement>('[data-draw="white-upper"]'),
    whiteLeft: svg.querySelector<SVGPathElement>('[data-draw="white-left"]'),
    whiteLower: svg.querySelector<SVGPathElement>('[data-draw="white-lower"]'),
    goldUpper: svg.querySelector('[data-gold="upper"]'),
    goldLower: svg.querySelector('[data-gold="lower"]'),
    fillLayer: svg.querySelector<SVGGElement>('[data-fill-layer]'),
  }
}

/** Reset mask strokes + gold to the pre-draw state. */
export function prepareBrandMarkDraw(
  gsapApi: GsapInstance,
  svg: SVGSVGElement,
  extras: DrawExtras = {},
) {
  const parts = queryDrawParts(svg)
  hideMaskStroke(parts.stem)
  hideMaskStroke(parts.whiteUpper)
  hideMaskStroke(parts.whiteLeft)
  hideMaskStroke(parts.whiteLower)

  // Opacity only — never scale gold (scale/origin shifts placement vs original).
  if (parts.goldUpper) gsapApi.set(parts.goldUpper, { opacity: 0 })
  if (parts.goldLower) gsapApi.set(parts.goldLower, { opacity: 0 })
  if (extras.glow) gsapApi.set(extras.glow, { opacity: 0.22 })
  if (extras.stage) gsapApi.set(extras.stage, { scale: 1 })

  return {
    ...parts,
    maskUrl: parts.fillLayer?.getAttribute('mask') ?? null,
  }
}

/**
 * Exact mark reveal sequence used by LogoDraw and Founder:
 * stem → upper white (+ left) → upper gold → lower white → lower gold → settle.
 */
export function buildBrandMarkDrawTimeline(
  gsapApi: GsapInstance,
  svg: SVGSVGElement,
  extras: DrawExtras = {},
) {
  const { stem, whiteUpper, whiteLeft, whiteLower, goldUpper, goldLower } =
    queryDrawParts(svg)
  const { glow, stage } = extras
  const tl = gsapApi.timeline()
  const dash = BRAND_MARK_HIDDEN_DASH

  if (stem) {
    tl.fromTo(
      stem,
      { attr: { 'stroke-dashoffset': dash } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 0.18, ease: 'none' },
      0,
    )
  }

  if (whiteUpper) {
    tl.fromTo(
      whiteUpper,
      { attr: { 'stroke-dashoffset': dash } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 0.34, ease: 'none' },
      0.14,
    )
  }

  // Same window as upper ring — covers the P-bowl left wall gap.
  if (whiteLeft) {
    tl.fromTo(
      whiteLeft,
      { attr: { 'stroke-dashoffset': dash } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 0.34, ease: 'none' },
      0.14,
    )
  }

  if (goldUpper) {
    tl.to(goldUpper, { opacity: 1, duration: 0.14, ease: 'none' }, 0.42)
  }

  if (whiteLower) {
    tl.fromTo(
      whiteLower,
      { attr: { 'stroke-dashoffset': dash } },
      { attr: { 'stroke-dashoffset': 0 }, duration: 0.3, ease: 'none' },
      0.52,
    )
  }

  if (goldLower) {
    tl.to(goldLower, { opacity: 1, duration: 0.14, ease: 'none' }, 0.78)
  }

  if (glow) {
    tl.to(glow, { opacity: 0.55, duration: 0.08, ease: 'none' }, 0.92)
  }
  if (stage) {
    tl.fromTo(
      stage,
      { scale: 0.994 },
      { scale: 1, duration: 0.08, ease: 'none', transformOrigin: '50% 50%' },
      0.92,
    )
  }

  return tl
}

/** Near progress 1.0, drop the mask so the final frame is the exact fill. */
export function syncBrandMarkSettleUnmask(
  fillLayer: SVGGElement | null,
  maskUrl: string | null,
  progress: number,
) {
  if (!fillLayer || !maskUrl) return
  if (progress >= 0.96) {
    fillLayer.removeAttribute('mask')
  } else {
    fillLayer.setAttribute('mask', maskUrl)
  }
}
