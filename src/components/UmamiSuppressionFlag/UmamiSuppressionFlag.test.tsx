import { isValidElement } from 'react'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mockIsTrackingSuppressed = vi.fn()

vi.mock('@/lib/umami/isTrackingSuppressed.server', () => ({
  isTrackingSuppressed: mockIsTrackingSuppressed,
}))

const { UmamiSuppressionFlag } = await import('./UmamiSuppressionFlag')

describe('UmamiSuppressionFlag', () => {
  afterEach(() => {
    mockIsTrackingSuppressed.mockReset()
  })

  it('renders null when tracking is not suppressed', async () => {
    mockIsTrackingSuppressed.mockResolvedValue(false)

    await expect(UmamiSuppressionFlag()).resolves.toBeNull()
  })

  it('renders an inline script setting window.__UMAMI_SUPPRESSED__ when tracking is suppressed', async () => {
    mockIsTrackingSuppressed.mockResolvedValue(true)

    const element = await UmamiSuppressionFlag()

    expect(isValidElement(element)).toBe(true)
    expect(element?.type).toBe('script')
    expect(element?.props.dangerouslySetInnerHTML.__html).toContain(
      'window.__UMAMI_SUPPRESSED__ = true;',
    )
  })
})
