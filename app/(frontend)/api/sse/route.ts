import { type RedisListener, subscribe } from '@/lib/RedisHandler'

export const runtime = 'nodejs'

const HEARTBEAT_INTERVAL_MS = 30_000

/**
 * Streams messages published on a Redis Pub/Sub channel to the browser via
 * Server-Sent Events.
 *
 * @example new EventSource('/api/sse?channel=service-status')
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel')

  if (!channel) {
    return new Response('Missing required "channel" query parameter', {
      status: 400,
    })
  }

  const encoder = new TextEncoder()

  let heartbeatInterval: ReturnType<typeof setInterval> | undefined
  let unsubscribeFromChannel: (() => Promise<void>) | undefined

  const stream = new ReadableStream({
    async start(controller) {
      const listener: RedisListener = (message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`))
      }

      unsubscribeFromChannel = await subscribe(channel, listener)

      heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'))
      }, HEARTBEAT_INTERVAL_MS)

      const cleanup = async () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        await unsubscribeFromChannel?.()
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
