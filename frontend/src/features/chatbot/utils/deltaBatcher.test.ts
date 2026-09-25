import { describe, expect, it, vi } from 'vitest'
import { createDeltaBatcher } from '@/features/chatbot/utils/deltaBatcher'

describe('createDeltaBatcher', () => {
  it('coalesces multiple pushes within one animation frame into a single flush', async () => {
    const flush = vi.fn()
    const batcher = createDeltaBatcher(flush)

    batcher.push('Hel')
    batcher.push('lo')
    batcher.push('!')

    expect(flush).not.toHaveBeenCalled()

    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(flush).toHaveBeenCalledTimes(1)
    expect(flush).toHaveBeenCalledWith('Hello!')
  })

  it('flushNow flushes immediately and cancels the pending scheduled flush', () => {
    const flush = vi.fn()
    const batcher = createDeltaBatcher(flush)

    batcher.push('Hello')
    batcher.flushNow()

    expect(flush).toHaveBeenCalledTimes(1)
    expect(flush).toHaveBeenCalledWith('Hello')
  })

  it('flushNow is a no-op when nothing is pending', () => {
    const flush = vi.fn()
    const batcher = createDeltaBatcher(flush)

    batcher.flushNow()

    expect(flush).not.toHaveBeenCalled()
  })

  it('cancel discards pending content without flushing it', async () => {
    const flush = vi.fn()
    const batcher = createDeltaBatcher(flush)

    batcher.push('discarded')
    batcher.cancel()

    await new Promise((resolve) => requestAnimationFrame(resolve))

    expect(flush).not.toHaveBeenCalled()
  })

  it('starts a fresh batch after a flush', async () => {
    const flush = vi.fn()
    const batcher = createDeltaBatcher(flush)

    batcher.push('first')
    batcher.flushNow()
    batcher.push('second')
    batcher.flushNow()

    expect(flush.mock.calls).toEqual([['first'], ['second']])
  })
})
