import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { getClient as getRedisClient } from '@/lib/RedisHandler'
import { CollectionSlug } from '@/types/collections'

/**
 * Pings Mongo (via a trivial Payload count) and Redis directly, rather than
 * just confirming the Next.js server process is up — a container can boot
 * cleanly yet be unable to reach either dependency with a misconfigured
 * `DATABASE_URL`/`REDIS_URL`, which a bare liveness check wouldn't catch.
 */
export async function GET() {
  await connection()

  const payload = await getPayload({
    config,
  })

  const [redis] = await Promise.all([
    getRedisClient(),
    payload.count({
      collection: CollectionSlug.PayloadJobs,
    }),
  ])

  const redisOk = (await redis.ping()) === 'PONG'

  return Response.json(
    {
      ok: redisOk,
    },
    {
      status: redisOk ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
