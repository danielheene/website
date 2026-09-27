// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NavEntry } from '@/fields/Link/lib/resolveLinkTarget'

import { FooterLegalLinks } from './FooterLegalLinks'

const fetchSiteSettingsCachedMock = vi.fn()

vi.mock('@/lib/fetchers', () => ({
  fetchSiteSettingsCached: () => fetchSiteSettingsCachedMock(),
}))

describe('FooterLegalLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders entries passed directly via props without fetching settings', async () => {
    const mockEntries: NavEntry[] = [
      {
        id: '1',
        linkType: 'custom',
        url: 'https://example.com/privacy',
        text: 'Privacy Policy',
      },
      {
        id: '2',
        linkType: 'custom',
        url: 'https://example.com/terms',
        text: 'Terms of Service',
      },
    ]

    const element = await FooterLegalLinks({
      entries: mockEntries,
    })
    render(element)

    expect(fetchSiteSettingsCachedMock).not.toHaveBeenCalled()
    expect(
      screen.getByRole('link', {
        name: 'Privacy Policy',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Terms of Service',
      }),
    ).toBeInTheDocument()
  })

  it('fetches settings and renders legal pages entries when entries prop is undefined', async () => {
    fetchSiteSettingsCachedMock.mockResolvedValue({
      footer: {
        legalPages: {
          entries: [
            {
              id: '3',
              linkType: 'custom',
              url: 'https://example.com/imprint',
              text: 'Imprint',
            },
          ],
        },
      },
    })

    const element = await FooterLegalLinks({})
    render(element)

    expect(fetchSiteSettingsCachedMock).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('link', {
        name: 'Imprint',
      }),
    ).toBeInTheDocument()
  })

  it('renders an empty navigation list gracefully if entries are null or empty', async () => {
    const element = await FooterLegalLinks({
      entries: null,
    })
    const { container } = render(element)

    expect(fetchSiteSettingsCachedMock).not.toHaveBeenCalled()
    expect(container.querySelectorAll('a')).toHaveLength(0)
  })
})
