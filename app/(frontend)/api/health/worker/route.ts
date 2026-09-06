import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { checkJobsHealth } from '@/jobs-queue/lib/checkJobsHealth'

/**
 * Pulled by an external monitor (Uptime Kuma HTTP(s) check) rather than
 * pushed to one, so it stays accurate even if the queue runner itself has
 * stopped entirely. See `checkJobsHealth` for what "healthy" means.
 *
 * `connection()` forces this route dynamic under `cacheComponents: true`,
 * so the monitor always reads the queue's current health instead of a
 * build-time cached response.
 */
export async function GET() {
  await connection()

  const payload = await getPayload({
    config,
  })

  const health = await checkJobsHealth(payload)

  return Response.json(health, {
    status: health.healthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
