import { connection } from 'next/server'

export async function GET() {
  await connection()

  const baseUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3100'
  const res = await fetch(`${baseUrl}/api/health/worker`, { cache: 'no-store' })
  const health = await res.json()

  return Response.json(health, {
    status: health.healthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
