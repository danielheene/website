import { afterEach, describe, expect, it, vi } from 'vitest'

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

afterEach(() => {
  payloadCreateMock.mockReset()
  getPayloadMock.mockClear()
})

const { uploadHeroSlideMedia } = await import('./uploadHeroSlideMedia')

const buildFormData = (file: File, kind: string) => {
  const formData = new FormData()
  formData.set('file', file)
  formData.set('kind', kind)
  return formData
}

describe('uploadHeroSlideMedia', () => {
  it('creates a MediaImages doc for kind "image"', async () => {
    payloadCreateMock.mockResolvedValue({
      id: 'img-1',
      url: '/media/hero.png',
    })

    const file = new File(
      [
        'x',
      ],
      'hero.png',
      {
        type: 'image/png',
      },
    )

    const result = await uploadHeroSlideMedia(buildFormData(file, 'image'))

    expect(payloadCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'images',
        file: expect.objectContaining({
          name: 'hero.png',
          mimetype: 'image/png',
        }),
      }),
    )
    expect(result).toEqual({
      id: 'img-1',
      kind: 'image',
      doc: {
        id: 'img-1',
        url: '/media/hero.png',
      },
    })
  })

  it('creates a MediaVideos doc for kind "video"', async () => {
    payloadCreateMock.mockResolvedValue({
      id: 'vid-1',
      url: '/media/hero.mp4',
    })

    const file = new File(
      [
        'x',
      ],
      'hero.mp4',
      {
        type: 'video/mp4',
      },
    )

    const result = await uploadHeroSlideMedia(buildFormData(file, 'video'))

    expect(payloadCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'videos',
      }),
    )
    expect(result.kind).toBe('video')
  })

  it('passes the file bytes as a Buffer with the correct size', async () => {
    payloadCreateMock.mockResolvedValue({
      id: 'img-2',
    })

    const file = new File(
      [
        'hello world',
      ],
      'hero.png',
      {
        type: 'image/png',
      },
    )

    await uploadHeroSlideMedia(buildFormData(file, 'image'))

    const call = payloadCreateMock.mock.calls[0]?.[0]
    expect(Buffer.isBuffer(call.file.data)).toBe(true)
    expect(call.file.size).toBe('hello world'.length)
  })

  it('throws when no file is provided', async () => {
    const formData = new FormData()
    formData.set('kind', 'image')

    await expect(uploadHeroSlideMedia(formData)).rejects.toThrow('No file was provided.')
    expect(payloadCreateMock).not.toHaveBeenCalled()
  })

  it('throws when kind is neither "image" nor "video"', async () => {
    const file = new File(
      [
        'x',
      ],
      'hero.png',
      {
        type: 'image/png',
      },
    )

    await expect(uploadHeroSlideMedia(buildFormData(file, 'shader'))).rejects.toThrow(
      'Unexpected upload kind: shader',
    )
    expect(payloadCreateMock).not.toHaveBeenCalled()
  })
})
