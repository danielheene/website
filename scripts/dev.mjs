#!/usr/bin/env node

/**
 *    `next dev` wrapper that owns the --tunnel flag.
 *
 *    Next parses its own argv and rejects unknown options, so the flag cannot
 *    be read inside next.config.ts. This wrapper strips it, translates it into
 *    DEV_TUNNEL=1, and forwards everything else through untouched.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const argv = process.argv.slice(2)
const tunnel = argv.includes('--tunnel')
const forwarded = argv.filter((arg) => arg !== '--tunnel')

/**
 *    Resolve Next's own CLI entry rather than relying on `next` being on PATH:
 *    pnpm only adds node_modules/.bin when it runs the script itself, so a bare
 *    `spawn('next')` breaks when this file is invoked directly.
 */
const require = createRequire(import.meta.url)
const nextCli = path.join(path.dirname(require.resolve('next/package.json')), 'dist/bin/next')

const child = spawn(process.execPath, [nextCli, 'dev', ...forwarded], {
  // Both streams are piped only when the tunnel line has to be spliced into
  // the startup banner; otherwise Next writes straight through untouched.
  stdio: tunnel ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  env: {
    ...process.env,
    ...(tunnel ? { DEV_TUNNEL: '1' } : {}),
  },
})

if (tunnel) {
  const MARKER = /__DEV_TUNNEL_URL__(\S+)\n?/
  let tunnelUrl = null
  let pending = null
  let done = false

  /**
   *    Splice the tunnel host in after Next's `- Network:` line so it reads as
   *    part of the address block rather than trailing the "Ready" line.
   */
  const splice = (text) => {
    const lines = text.split('\n')
    const at = lines.findIndex((line) => line.startsWith('- Network:'))
    // Nothing to anchor to: pass the banner through rather than lose it.
    if (at === -1) return text

    const label = '- Tunnel:'
    // Match the column Next pads its own labels to.
    const pad = ' '.repeat(Math.max(1, lines[at].indexOf('http') - label.length))
    lines.splice(at + 1, 0, `${label}${pad}${tunnelUrl}`)
    return lines.join('\n')
  }

  const flush = () => {
    if (done || pending === null) return
    done = true
    process.stdout.write(tunnelUrl ? splice(pending) : pending)
    pending = null
  }

  /**
   *    next.config.ts reports the URL on stderr, but Next loads the config in a
   *    worker whose output can arrive *after* the address block — so the block
   *    is held back briefly rather than printed as it arrives.
   */
  child.stderr.on('data', (chunk) => {
    let text = chunk.toString()
    const marker = text.match(MARKER)

    if (marker) {
      tunnelUrl = marker[1]
      text = text.replace(MARKER, '')
      flush()
      if (!text) return
    }

    process.stderr.write(text)
  })

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString()

    if (!done && /^- Network:/m.test(text)) {
      pending = text
      if (tunnelUrl) {
        flush()
        return
      }
      // Cap the wait so a failed tunnel never swallows the banner.
      setTimeout(flush, 2000).unref()
      return
    }

    process.stdout.write(text)
  })
}

child.on('exit', (code, signal) => {
  // Re-raise the signal so the shell sees a normal Ctrl-C rather than exit 0.
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}

// Backstop for SIGKILL/uncaught exits, which skip the signal handlers above and
// would otherwise strand the dev server as an orphan holding .next/dev/lock.
process.on('exit', () => {
  if (!child.killed) {
    child.kill('SIGTERM')
  }
})
