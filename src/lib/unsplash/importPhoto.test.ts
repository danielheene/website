import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()
const payloadCreateMock = vi.fn()
const getPayloadMock = vi.fn(async () => ({
  create: payloadCreateMock,
}))

vi.mock('payload', () => ({
  getPayload: () => getPayloadMock(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('UNSPLASH_ACCESS_KEY', 'test-access-key')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  fetchMock.mockReset()
  payloadCreateMock.mockReset()
  getPayloadMock.mockClear()
})

const { importPhoto } = await import('./importPhoto')

const photoDetailResponse = () => ({
  id: 'abc123',
  urls: {
    full: 'https://images.unsplash.com/abc123-full',
  },
  links: {
    download_location: 'https://api.unsplash.com/photos/abc123/download',
  },
  user: {
    name: 'Jane Doe',
    links: {
      html: 'https://unsplash.com/@janedoe',
    },
  },
})

describe('importPhoto', () => {
  it('downloads the full image, pings the download endpoint, and creates a MediaImages doc', async () => {
    const imageBytes = new Uint8Array([
      1,
      2,
      3,
    ])

    fetchMock.mockImplementation(async (url: string) => {
      const parsedUrl = new URL(String(url))
      if (String(url).includes('/photos/abc123') && !String(url).includes('download')) {
        return {
          ok: true,
          status: 200,
          json: async () => photoDetailResponse(),
        }
      }
      if (String(url).includes('/photos/abc123/download')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            url: 'https://images.unsplash.com/abc123-full?tracked=1',
          }),
        }
      }
      if (parsedUrl.hostname === 'images.unsplash.com') {
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => imageBytes.buffer,
          headers: new Map([
            [
              'content-type',
              'image/jpeg',
            ],
          ]),
        }
      }
      throw new Error(`Unexpected fetch to ${url}`)
    })

    payloadCreateMock.mockResolvedValue({
      id: 'doc-1',
      url: '/media/abc123-full.jpg',
      alt: null,
      blurDataURL: null,
    })

    const result = await importPhoto({
      photoId: 'abc123',
    })

    expect(payloadCreateMock).toHaveBeenCalledTimes(1)
    const [call] = payloadCreateMock.mock.calls
    expect(call[0].collection).toBe('images')
    expect(call[0].data.generatorFlags).toEqual([
      'unsplash-import',
    ])
    // The link text lives in the node's `children`, not a `label` field —
    // lexical's stock link fields have no `label`. See buildCreditsValue.
    expect(call[0].data.credits.root.children[0].children[1].children[0].text).toBe('Jane Doe')
    expect(call[0].file.data).toBeInstanceOf(Buffer)
    expect(call[0].file.mimetype).toBe('image/jpeg')

    expect(result).toEqual({
      id: 'doc-1',
      url: '/media/abc123-full.jpg',
      alt: null,
      blurDataURL: null,
    })
  })

  it('throws and creates nothing when the image download fails', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes('/photos/abc123') && !String(url).includes('download')) {
        return {
          ok: true,
          status: 200,
          json: async () => photoDetailResponse(),
        }
      }
      if (String(url).includes('/photos/abc123/download')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            url: 'https://images.unsplash.com/abc123-full?tracked=1',
          }),
        }
      }
      return {
        ok: false,
        status: 500,
        arrayBuffer: async () => new ArrayBuffer(0),
      }
    })

    await expect(
      importPhoto({
        photoId: 'abc123',
      }),
    ).rejects.toThrow()

    expect(payloadCreateMock).not.toHaveBeenCalled()
  })

  it('throws when UNSPLASH_ACCESS_KEY is not configured', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', '')

    await expect(
      importPhoto({
        photoId: 'abc123',
      }),
    ).rejects.toThrow(/UNSPLASH_ACCESS_KEY/)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(payloadCreateMock).not.toHaveBeenCalled()
  })
})
