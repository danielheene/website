#!/usr/bin/env node

/**
 *    `next dev` wrapper.
 *
 *    Next parses its own argv and rejects unknown options, so extra flags are
 *    stripped here and forwarded as environment variables instead. The
 *    Cloudflare tunnel used to be handled the same way; it now lives in the
 *    root `scripts/tunnel.mjs` and is started separately (`bun run dev:tunnel`),
 *    so neither app's Next config spawns a tunnel any more.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const argv = process.argv.slice(2)

/**
 *    Resolve Next's own CLI entry rather than relying on `next` being on PATH:
 *    the package manager only adds node_modules/.bin when it runs the script, so a bare
 *    `spawn('next')` breaks when this file is invoked directly.
 */
const require = createRequire(import.meta.url)
const nextCli = path.join(path.dirname(require.resolve('next/package.json')), 'dist/bin/next')

const child = spawn(process.execPath, [nextCli, 'dev', ...argv], {
  stdio: 'inherit',
})

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
