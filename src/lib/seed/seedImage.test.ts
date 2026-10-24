import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchSeedImage } from './seedImage'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

const okResponse = (byte: number) => new Response(new Uint8Array([byte]), { status: 200 })

describe('fetchSeedImage', () => {
  it('returns the first source when it succeeds', async () => {
    fetchMock.mockResolvedValueOnce(okResponse(1))

    const data = await fetchSeedImage('seed-1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(data).toEqual(Buffer.from([1]))
  })

  it('falls back to the next source on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
    fetchMock.mockResolvedValueOnce(okResponse(2))

    const data = await fetchSeedImage('seed-1')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(data).toEqual(Buffer.from([2]))
  })

  it('falls back to the next source when fetch itself rejects', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network error'))
    fetchMock.mockResolvedValueOnce(okResponse(3))

    const data = await fetchSeedImage('seed-1')

    expect(data).toEqual(Buffer.from([3]))
  })

  it('throws the last error when every source fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
    fetchMock.mockRejectedValueOnce(new Error('network error'))

    await expect(fetchSeedImage('seed-1')).rejects.toThrow('network error')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
