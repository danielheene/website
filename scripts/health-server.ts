/**
 *    Standalone HTTP health server for the `worker` container.
 *
 *    Usage:
 *      pnpm run payload run scripts/health-server.ts
 *
 *    `payload jobs:run` (see `start:worker`) is a CLI loop with no HTTP
 *    listener of its own, so a container `HEALTHCHECK` has nothing to curl
 *    locally. This starts a tiny server alongside it, in the same container,
 *    reporting the same `checkJobsHealth` truth the Next.js app exposes at
 *    `/api/health/jobs` — reachable at `http://localhost:$JOB_RUNNER_HEALTH_PORT/health`
 *    without depending on the app container or any external network.
 *
 *    Runs forever; `worker`'s CMD is expected to start this alongside
 *    `jobs:run` (see `scripts/start-worker.mjs`), not in place of it.
 *
 *    `payload run <script>` calls `process.exit(0)` as soon as this module's
 *    top-level code finishes importing — it doesn't wait for the event loop
 *    to drain the way plain `node script.ts` would. `server.listen()` alone
 *    would therefore be torn down immediately. The unresolved promise at the
 *    bottom of this file, settled only on SIGTERM/SIGINT, is what actually
 *    keeps the process (and the listening socket) alive.
 */
import { createServer } from 'node:http'

import config from '@payload-config'
import { getPayload } from 'payload'

import { checkJobsHealth } from '@/jobs-queue/lib/checkJobsHealth'

const port = Number(process.env.JOB_RUNNER_HEALTH_PORT ?? 3010)

const payload = await getPayload({
  config,
})

const server = createServer((req, res) => {
  if (req.url !== '/health') {
    res.writeHead(404).end()
    return
  }

  checkJobsHealth(payload)
    .then((health) => {
      res.writeHead(health.healthy ? 200 : 503, {
        'Content-Type': 'application/json',
      })
      res.end(JSON.stringify(health))
    })
    .catch((error) => {
      payload.logger.error(error, 'Job health check failed')
      res.writeHead(500, {
        'Content-Type': 'application/json',
      })
      res.end(
        JSON.stringify({
          healthy: false,
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    })
})

server.listen(port, () => {
  payload.logger.info(`Job runner health server listening on :${port}`)
})

/**
 * Keeps `payload run`'s top-level import from resolving (and the process
 * from exiting) until the container is actually told to stop — see the
 * module doc comment above.
 */
await new Promise<void>((resolve) => {
  const shutdown = () => {
    server.close()
    resolve()
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
})
