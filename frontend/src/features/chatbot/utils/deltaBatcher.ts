/**
 * Coalesces rapid successive text fragments into at most one flush per
 * animation frame, so a fast model (many small SSE deltas per second)
 * doesn't trigger hundreds of React renders per second. The backend's own
 * chunking already keeps individual deltas at a clause-ish granularity,
 * so this is mostly a safety margin for an unusually chatty stream.
 */
export interface DeltaBatcher {
  /** Queue a fragment; schedules a flush on the next animation frame. */
  push: (fragment: string) => void
  /** Flush immediately and cancel any pending scheduled flush. */
  flushNow: () => void
  /** Cancel any pending scheduled flush without flushing. */
  cancel: () => void
}

export function createDeltaBatcher(flush: (batched: string) => void): DeltaBatcher {
  let buffer = ''
  let frameHandle: number | null = null

  function runFlush(): void {
    frameHandle = null
    if (buffer === '') return
    const toFlush = buffer
    buffer = ''
    flush(toFlush)
  }

  return {
    push(fragment: string) {
      buffer += fragment
      if (frameHandle === null) {
        frameHandle = requestAnimationFrame(runFlush)
      }
    },
    flushNow() {
      if (frameHandle !== null) {
        cancelAnimationFrame(frameHandle)
        frameHandle = null
      }
      runFlush()
    },
    cancel() {
      if (frameHandle !== null) {
        cancelAnimationFrame(frameHandle)
        frameHandle = null
      }
      buffer = ''
    },
  }
}
