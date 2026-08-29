import config from '@payload-config'
import { getPayload } from 'payload'

import { checkJobsHealth } from '@/jobs-queue/lib/checkJobsHealth'

/**
 * Pulled by an external monitor (Uptime Kuma HTTP(s) check) rather than
 * pushed to one, so it stays accurate even if the queue runner itself has
 * stopped entirely. See `checkJobsHealth` for what "healthy" means.
 */
export async function GET() {
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
