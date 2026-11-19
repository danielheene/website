import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchGlobalUserSettings = vi.fn()

vi.mock('@/lib/fetchers', () => ({
  fetchGlobalUserSettings: (locale: string) => fetchGlobalUserSettings(locale),
}))

import { buildDocumentHeader } from './buildDocumentHeader'

const baseSettings = {
  address: {
    street: 'Main St',
    number: '1',
    postCode: '12345',
    place: 'Berlin',
  },
  phoneNumber: {
    value: '+493012345678',
    formatted: '+49 (0) 30 12345678',
    uri: 'tel:+493012345678',
  },
  email: 'daniel@heene.io',
  url: 'https://heene.io',
  sameAs: [
    {
      url: 'https://github.com/danielheene',
    },
  ],
}

describe('buildDocumentHeader', () => {
  beforeEach(() => {
    fetchGlobalUserSettings.mockReset()
  })

  it('reads the portrait URL when the regular variant is populated', async () => {
    fetchGlobalUserSettings.mockResolvedValue({
      ...baseSettings,
      portrait: {
        regular: {
          value: {
            url: 'https://cdn.example.com/portrait.png',
          },
        },
      },
    })

    const header = await buildDocumentHeader('en')

    expect(header.portraitUrl).toBe('https://cdn.example.com/portrait.png')
  })

  it('throws a clear error when the portrait is not set', async () => {
    fetchGlobalUserSettings.mockResolvedValue({
      ...baseSettings,
      portrait: {
        regular: {
          value: null,
        },
      },
    })

    await expect(buildDocumentHeader('en')).rejects.toThrow(/portrait/i)
  })

  it('builds the telephone link from the stored phone number', async () => {
    fetchGlobalUserSettings.mockResolvedValue({
      ...baseSettings,
      portrait: {
        regular: {
          value: {
            url: 'https://cdn.example.com/portrait.png',
          },
        },
      },
    })

    const header = await buildDocumentHeader('en')

    expect(header.telephone).toEqual({
      label: '+49 (0) 30 12345678',
      href: 'tel:+493012345678',
    })
  })

  it('throws a clear error when the phone number is not set', async () => {
    fetchGlobalUserSettings.mockResolvedValue({
      ...baseSettings,
      phoneNumber: {
        value: '',
        formatted: '',
        uri: '',
      },
      portrait: {
        regular: {
          value: {
            url: 'https://cdn.example.com/portrait.png',
          },
        },
      },
    })

    await expect(buildDocumentHeader('en')).rejects.toThrow(/phoneNumber/)
  })

  it('throws a clear error when the portrait field is entirely missing', async () => {
    fetchGlobalUserSettings.mockResolvedValue({
      ...baseSettings,
      portrait: undefined,
    })

    await expect(buildDocumentHeader('en')).rejects.toThrow(/portrait/i)
  })
})
