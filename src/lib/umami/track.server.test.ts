import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendUmamiPayload } from './sendUmamiPayload'
import { trackServerEvent } from './track.server'

vi.mock('./sendUmamiPayload', () => ({
  sendUmamiPayload: vi.fn().mockResolvedValue(undefined),
}))

const SITE_ID = 'site-abc'

describe('trackServerEvent', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', SITE_ID)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('sends a minimal payload when called with just a name', async () => {
    await trackServerEvent({
      name: 'my-event',
    })

    expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
    expect(sendUmamiPayload).toHaveBeenCalledWith({
      type: 'event',
      payload: {
        website: SITE_ID,
        name: 'my-event',
      },
    })
  })

  it('sends all fields when data/url/referrer/hostname are provided', async () => {
    await trackServerEvent({
      name: 'my-event',
      data: {
        foo: 'bar',
      },
      url: '/some/path',
      referrer: 'https://referrer.example.com',
      hostname: 'example.com',
    })

    expect(sendUmamiPayload).toHaveBeenCalledWith({
      type: 'event',
      payload: {
        website: SITE_ID,
        name: 'my-event',
        data: {
          foo: 'bar',
        },
        url: '/some/path',
        referrer: 'https://referrer.example.com',
        hostname: 'example.com',
      },
    })
  })

  it('never throws or rejects even if sendUmamiPayload were to throw', async () => {
    vi.mocked(sendUmamiPayload).mockImplementationOnce(() => {
      throw new Error('boom')
    })

    await expect(
      trackServerEvent({
        name: 'my-event',
      }),
    ).resolves.toBeUndefined()
  })

  it('never rejects even if sendUmamiPayload were to reject', async () => {
    vi.mocked(sendUmamiPayload).mockRejectedValueOnce(new Error('boom'))

    await expect(
      trackServerEvent({
        name: 'my-event',
      }),
    ).resolves.toBeUndefined()
  })

  it('does not send when NEXT_PUBLIC_UMAMI_DO_NOT_TRACK is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_DO_NOT_TRACK', 'true')

    await trackServerEvent({
      name: 'my-event',
    })

    expect(sendUmamiPayload).not.toHaveBeenCalled()
  })
})
