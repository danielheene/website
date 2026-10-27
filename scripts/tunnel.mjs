#!/usr/bin/env node

/**
 *    Cloudflare tunnel for local development.
 *
 *    Starts `wrangler tunnel run` against the tunnel token and keeps it in the
 *    foreground. The dev servers read the resulting public URL from the
 *    environment, so this script is the only place that knows about the
 *    tunnel at all — neither app's Next config spawns it any more.
 *
 *    Usage:
 *      bun run tunnel        # the tunnel only
 *      bun run dev:tunnel    # the tunnel plus every dev server
 *
 *    Required environment:
 *      CLOUDFLARE_TUNNEL_URL    the public URL the tunnel serves
 *      CLOUDFLARE_TUNNEL_HOST   the hostname the dev servers bind to
 *      CLOUDFLARE_TUNNEL_TOKEN  the tunnel token
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

const argv = process.argv.slice(2)

/** `--with-dev` starts the dev servers alongside the tunnel. */
const withDev = argv.includes('--with-dev')

const required = ['CLOUDFLARE_TUNNEL_URL', 'CLOUDFLARE_TUNNEL_HOST', 'CLOUDFLARE_TUNNEL_TOKEN']
const missing = required.filter((name) => !process.env[name])

if (missing.length > 0) {
  console.error(`\n[tunnel] missing environment: ${missing.join(', ')}\n`)
  process.exit(1)
}

/**
 *    Resolve the wrangler CLI rather than relying on `npx` finding it: the
 *    package manager only adds node_modules/.bin when it runs a script, and a
 *    bare `spawn('wrangler')` breaks when this file is invoked directly.
 */
const wranglerCli = path.join(
  path.dirname(require.resolve('wrangler/package.json')),
  'bin',
  'wrangler.js',
)

const children = []

const tunnel = spawn(
  process.execPath,
  [wranglerCli, 'tunnel', 'run', '--token', process.env.CLOUDFLARE_TUNNEL_TOKEN],
  { stdio: 'inherit' },
)

children.push(tunnel)

tunnel.on('error', (error) => {
  console.error(`\n[tunnel] could not start wrangler: ${error.message}\n`)
  process.exit(1)
})

/**
 *    The dev servers must believe they are serving the public URL, otherwise
 *    Next's own banner, the generated absolute links and the redirects all
 *    point at localhost.
 */
const devEnv = {
  ...process.env,
  SERVER_HOST: process.env.CLOUDFLARE_TUNNEL_HOST,
  SERVER_URL: process.env.CLOUDFLARE_TUNNEL_URL,
}

if (withDev) {
  const turboCli = path.join(path.dirname(require.resolve('turbo/package.json')), 'bin', 'turbo')

  const dev = spawn(process.execPath, [turboCli, 'run', 'dev'], {
    stdio: 'inherit',
    env: devEnv,
  })

  children.push(dev)

  dev.on('error', (error) => {
    console.error(`\n[tunnel] could not start the dev servers: ${error.message}\n`)
    process.exit(1)
  })
}

let shuttingDown = false

const shutdown = (signal) => {
  if (shuttingDown) return
  shuttingDown = true

  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal))
}

// Backstop for SIGKILL/uncaught exits, which skip the signal handlers above
// and would otherwise strand the tunnel (and the dev servers) as orphans.
process.on('exit', () => shutdown('SIGTERM'))

/**
 *    The tunnel dying is fatal: without it the dev servers would keep serving
 *    a public URL that no longer resolves.
 */
tunnel.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)

    return
  }

  shutdown('SIGTERM')
  process.exit(code ?? 0)
})

console.info(`\n[tunnel] serving ${process.env.CLOUDFLARE_TUNNEL_URL}\n`)
