import { afterEach, describe, expect, it, vi } from 'vitest'
import { delay } from '../delay'

describe('delay', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves only after the given time has passed', async () => {
    vi.useFakeTimers()
    const done = vi.fn()

    const promise = delay(500).then(done)

    await vi.advanceTimersByTimeAsync(499)
    expect(done).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(done).toHaveBeenCalledOnce()
    await promise
  })
})
