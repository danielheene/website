/**
 * Trivial liveness check for the `app` container — always 200 while the
 * Next.js server can handle a request at all. Registered as this image's
 * Docker `HEALTHCHECK`; see `/api/health/jobs` for the job-queue-aware
 * check used by external uptime monitoring.
 */
export async function GET() {
  return Response.json(
    {
      ok: true,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    },
  )
}
