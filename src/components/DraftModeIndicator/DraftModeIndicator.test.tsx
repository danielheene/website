import { isValidElement } from 'react'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mockDraftMode = vi.fn()
const mockHeaders = vi.fn()

vi.mock('next/headers', () => ({
  draftMode: mockDraftMode,
  headers: mockHeaders,
}))

const { DraftModeIndicator } = await import('./DraftModeIndicator')

describe('DraftModeIndicator', () => {
  afterEach(() => {
    mockDraftMode.mockReset()
    mockHeaders.mockReset()
  })

  it('renders null when draft mode is disabled', async () => {
    mockDraftMode.mockResolvedValue({
      isEnabled: false,
    })

    await expect(DraftModeIndicator()).resolves.toBeNull()
  })

  it('renders an exit link back to the current path when draft mode is enabled', async () => {
    mockDraftMode.mockResolvedValue({
      isEnabled: true,
    })
    mockHeaders.mockResolvedValue(
      new Headers({
        'X-Current-Path': '/about-me',
      }),
    )

    const element = await DraftModeIndicator()

    expect(isValidElement(element)).toBe(true)

    const link = element?.props.children[2]
    expect(link.props.href).toBe('/api/preview?action=disable&path=%2Fabout-me')
  })

  it('falls back to the root path when the current-path header is missing', async () => {
    mockDraftMode.mockResolvedValue({
      isEnabled: true,
    })
    mockHeaders.mockResolvedValue(new Headers())

    const element = await DraftModeIndicator()
    const link = element?.props.children[2]

    expect(link.props.href).toBe('/api/preview?action=disable&path=%2F')
  })

  it('encodes special characters in the current path', async () => {
    mockDraftMode.mockResolvedValue({
      isEnabled: true,
    })
    mockHeaders.mockResolvedValue(
      new Headers({
        'X-Current-Path': '/blog?sort=title&page=2',
      }),
    )

    const element = await DraftModeIndicator()
    const link = element?.props.children[2]

    expect(link.props.href).toBe(
      '/api/preview?action=disable&path=%2Fblog%3Fsort%3Dtitle%26page%3D2',
    )
  })
})
