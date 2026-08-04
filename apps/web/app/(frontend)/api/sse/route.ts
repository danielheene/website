import { type RedisListener, subscribe } from '@/lib/RedisHandler'
import { isSseChannel } from '@/lib/sse/channels'

const HEARTBEAT_INTERVAL_MS = 30_000

/**
 *    Ceiling on concurrently open streams.
 *
 *    This endpoint is unauthenticated and each connection holds a Redis
 *    listener plus an interval for as long as the client keeps it open, so
 *    without a cap a handful of clients can exhaust the server's connections.
 */
const MAX_CONCURRENT_STREAMS = 100
let openStreams = 0

/**
 * Streams messages published on a Redis Pub/Sub channel to the browser via
 * Server-Sent Events.
 *
 * @example new EventSource('/api/sse?channel=service-status')
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')

  /**
   *    The channel is attacker-controlled, so it is matched against an
   *    allowlist rather than passed through: `subscribe()` hands it straight to
   *    Redis, which would otherwise let anyone read any Pub/Sub channel.
   *    Unknown channels get the same 400 as a missing one — enumerating which
   *    channels exist is not something an anonymous caller needs to do.
   */
  if (!isSseChannel(channel)) {
    return new Response('Missing or unsupported "channel" query parameter', {
      status: 400,
    })
  }

  if (openStreams >= MAX_CONCURRENT_STREAMS) {
    return new Response('Too many concurrent streams', {
      status: 503,
      headers: {
        'Retry-After': '30',
      },
    })
  }

  const encoder = new TextEncoder()

  let heartbeatInterval: ReturnType<typeof setInterval> | undefined
  let unsubscribeFromChannel: (() => Promise<void>) | undefined

  // Guarded so the slot is released exactly once, no matter which of the
  // teardown paths below runs first.
  let released = false
  const release = () => {
    if (released) return
    released = true
    openStreams -= 1
  }

  openStreams += 1

  const stream = new ReadableStream({
    async start(controller) {
      const listener: RedisListener = (message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      }

      try {
        unsubscribeFromChannel = await subscribe(channel, listener)
      } catch (error) {
        // Redis unreachable: give the slot back rather than leaking it.
        release()
        controller.error(error)
        return
      }

      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'))
      }, HEARTBEAT_INTERVAL_MS)

      const cleanup = async () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        await unsubscribeFromChannel?.()
        release()
        try {
          controller.close()
        } catch {
          // controller might already be closed
        }
      }

      request.signal.addEventListener('abort', () => {
        void cleanup()
      })
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      void unsubscribeFromChannel?.()
      release()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
