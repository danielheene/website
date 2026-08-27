#!/usr/bin/env node

/**
 *    Worker container entrypoint: runs the Payload job queue (`jobs:run`)
 *    and the standalone health server (`scripts/health-server.ts`) as
 *    sibling processes in one container.
 *
 *    `jobs:run` is a CLI loop with no HTTP listener, so a Docker
 *    `HEALTHCHECK` needs something local to curl — the health server fills
 *    that gap by reporting the same job-queue state
 *    (`src/jobs-queue/lib/checkJobsHealth.ts`) over HTTP.
 *
 *    Either process exiting is treated as the container failing: if the job
 *    runner dies, health checks alone won't catch it once the health server
 *    also stops responding, but if the health server dies first the runner
 *    would otherwise carry on invisibly, unmonitored, until something else
 *    noticed. Both are stopped and the container exits non-zero, so
 *    Dokploy/Swarm restarts it either way.
 *
 *    Payload's CLI binary is spawned directly (not via `pnpm run`): pnpm's
 *    own `run` is an extra shell hop between this wrapper and the actual
 *    process, and a signal sent to that hop is not reliably forwarded to its
 *    child — confirmed by SIGTERM/SIGKILL sent to the pnpm process leaving
 *    the underlying `payload` process running. Resolving the CLI entry
 *    directly (as scripts/dev.mjs already does for Next's) avoids the hop
 *    entirely, so `shutdown()` below actually reaches the process it signals.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

// `payload/package.json` isn't itself an exported subpath, so it can't be
// resolved directly (unlike next/package.json, which scripts/dev.mjs relies
// on) — the main entry (`dist/index.js`, which *is* exported) is resolved
// instead, and bin.js is a sibling of its package root one level up.
const require = createRequire(import.meta.url)
const payloadPkgRoot = path.dirname(path.dirname(require.resolve('payload')))
const payloadCli = path.join(payloadPkgRoot, 'bin.js')

const jobRunner = spawn(
  process.execPath,
  [
    payloadCli,
    'jobs:run',
    '--cron',
    '* * * * *',
    '--all-queues',
    '--handle-schedules',
    '--limit',
    '10',
  ],
  {
    stdio: 'inherit',
  },
)

const healthServer = spawn(process.execPath, [payloadCli, 'run', 'scripts/health-server.ts'], {
  stdio: 'inherit',
})

const children = [jobRunner, healthServer]
let shuttingDown = false

const shutdown = (signal) => {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

const onChildExit = (name) => (code, signal) => {
  if (shuttingDown) return
  console.error(`[start-worker] ${name} exited (code=${code}, signal=${signal}) — stopping`)
  shutdown('SIGTERM')
  process.exitCode = code ?? 1
}

jobRunner.on('exit', onChildExit('jobs:run'))
healthServer.on('exit', onChildExit('health-server'))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal))
}

process.on('exit', () => shutdown('SIGTERM'))
