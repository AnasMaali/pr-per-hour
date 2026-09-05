import { useCallback, useEffect, useRef, useState } from 'react'

const BOTTOM_THRESHOLD_PX = 96

/**
 * Conversation scroll UX: auto-scroll to a new message only when the
 * visitor was already near the bottom; otherwise surface a "new message"
 * affordance instead of yanking their scroll position.
 */
export function useSmartScroll<T extends HTMLElement>(watched: unknown) {
  const containerRef = useRef<T | null>(null)
  const isNearBottomRef = useRef(true)
  const previousWatchedRef = useRef(watched)
  const [hasNewBelow, setHasNewBelow] = useState(false)

  const measureNearBottom = useCallback((): boolean => {
    const el = containerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD_PX
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    isNearBottomRef.current = true
    setHasNewBelow(false)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const near = measureNearBottom()
      isNearBottomRef.current = near
      if (near) setHasNewBelow(false)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [measureNearBottom])

  useEffect(() => {
    if (previousWatchedRef.current === watched) return
    previousWatchedRef.current = watched

    // Judge by the scroll position captured *before* this update grew the
    // content, never by re-measuring after — the container is already
    // taller by then and would look "far" even if the visitor was at rest.
    if (isNearBottomRef.current) {
      const frame = requestAnimationFrame(() => scrollToBottom('smooth'))
      return () => cancelAnimationFrame(frame)
    }

    setHasNewBelow(true)
    return undefined
  }, [watched, scrollToBottom])

  return { containerRef, hasNewBelow, scrollToBottom }
}
