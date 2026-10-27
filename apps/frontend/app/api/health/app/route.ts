import { connection } from 'next/server'

import { getClient as getRedisClient } from '@website/lib/RedisHandler'

/**
 * Pings Redis directly. Mongo/Payload health is checked by the backend service.
 */
export async function GET() {
  await connection()

  const redis = await getRedisClient()
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
