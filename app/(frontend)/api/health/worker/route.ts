import { connection } from 'next/server'
import config from '@payload-config'
import { getPayload } from 'payload'

import { checkJobsHealth } from '@/jobs-queue/lib/checkJobsHealth'

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
