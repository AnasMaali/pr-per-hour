/**
 * Scroll to the top of the page. Long distances jump instantly so pinned
 * GSAP scrub sections are not replayed frame-by-frame.
 */
export function scrollToPageTop(options?: { behavior?: ScrollBehavior }): void {
  const distance = window.scrollY
  const behavior =
    options?.behavior ??
    (distance > window.innerHeight * 0.75 ? 'auto' : 'smooth')

  window.scrollTo({ top: 0, behavior })
}

/**
 * Scroll to an in-page hash target, clearing the fixed public header.
 *
 * Long jumps use instant scroll so pinned GSAP scrub sections are not
 * played frame-by-frame (that is what feels like a hang on About / Approach).
 */
export function scrollToHashId(
  hashOrId: string,
  options?: { behavior?: ScrollBehavior },
): boolean {
  const id = hashOrId.replace(/^#/, '')
  if (!id) return false

  const el = document.getElementById(id)
  if (!el) return false

  const header = document.querySelector<HTMLElement>('.public-header')
  const offset = (header?.getBoundingClientRect().height ?? 80) + 12
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  const clampedTop = Math.max(0, top)
  const distance = Math.abs(clampedTop - window.scrollY)

  // Short hops can stay smooth; long hops skip scrubbed pin ranges.
  const behavior =
    options?.behavior ??
    (distance > window.innerHeight * 0.75 ? 'auto' : 'smooth')

  window.scrollTo({
    top: clampedTop,
    behavior,
  })

  return true
}

/**
 * Retry scroll after layout / ScrollTrigger pin spacers settle.
 * Refresh at most twice and prefer instant re-align so mid-scroll refreshes
 * do not thrash pinned timelines.
 */
export function scheduleScrollToHash(
  hashOrId: string,
  options?: {
    behavior?: ScrollBehavior
    onRefresh?: () => void
    onAfterScroll?: () => void
  },
): () => void {
  let cancelled = false

  const run = (refresh: boolean, behavior?: ScrollBehavior) => {
    if (cancelled) return
    if (refresh) options?.onRefresh?.()
    scrollToHashId(hashOrId, {
      behavior: behavior ?? options?.behavior,
    })
    options?.onAfterScroll?.()
  }

  const frame = window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => run(true, options?.behavior))
  })

  // One correction after pin spacers settle — always instant to avoid jank.
  const t1 = window.setTimeout(() => run(true, 'auto'), 120)

  return () => {
    cancelled = true
    window.cancelAnimationFrame(frame)
    window.clearTimeout(t1)
  }
}
