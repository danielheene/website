import { connection } from 'next/server'

/**
 * Trivial liveness check for the `app` container — always 200 while the
 * Next.js server can handle a request at all. Registered as this image's
 * Docker `HEALTHCHECK`; see `/api/health/worker` for the job-queue-aware
 * check used by external uptime monitoring.
 *
 * `connection()` forces this route dynamic under `cacheComponents: true`,
 * so a HEALTHCHECK always reaches a live process instead of a build-time
 * cached response.
 */
export async function GET() {
  await connection()

  return Response.json(
    {
      ok: true,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
