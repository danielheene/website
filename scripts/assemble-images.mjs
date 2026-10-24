#!/usr/bin/env node

/**
 *    Assembles the exact files each Docker image contains into `out/<target>`.
 *    The Dockerfile only COPYs these directories: nothing is installed or built
 *    inside an image.
 *
 *    Usage: node scripts/assemble-images.mjs <web|worker|storybook>
 *
 *    web        needs `.next` (run `next build` first) and network access to
 *               install production dependencies
 *    worker     needs network access to install production dependencies
 *    storybook  needs `dist/` (bun run build:storybook)
 */

import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const target = process.argv[2]
const out = path.join(root, 'out', target ?? '')

const fail = (message) => {
  console.error(`[assemble-images] ${message}`)
  process.exit(1)
}

// Tests and stories are never executed in an image. `.map` files are uploaded
// to Rustrak (see the CI build step that runs `sentry-cli sourcemaps upload`)
// before this script runs, then excluded here so they never ship to a browser
// or sit in a production container — only the upload copy is allowed to see them.
const NOT_SHIPPED = /\.(test|spec|stories)\.(ts|tsx|mdx)$|\.map$/

const copy = (from, to = from) => {
  const source = path.join(root, from)

  if (!existsSync(source)) fail(`missing ${from}`)
  cpSync(source, path.join(out, to), {
    recursive: true,
    dereference: false,
    filter: (file) => !NOT_SHIPPED.test(file),
  })
}

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  })

  if (result.status !== 0) fail(`${command} ${args.join(' ')} failed`)
}

const assemblers = {
  // No `output: 'standalone'` — its Node require-tracing has repeatedly
  // conflicted with Turbopack's content-hashed module ids under Sentry's
  // require-patching integrations (redis/mongoose/pino), crashing the server
  // on boot. `next start` against a plain install avoids that trace step
  // entirely, at the cost of a full `node_modules` instead of a pruned one.
  web: () => {
    // `next.config.ts` imports `@/types/environment` and `withPayload` reads
    // the Payload config, so `next start` needs the real source tree and
    // `tsconfig.json`'s `@/` alias — not just `.next` — to re-load config at
    // startup, the same as the worker image below.
    for (const entry of [
      '.next',
      'package.json',
      'bun.lock',
      'bunfig.toml',
      'tsconfig.json',
      'next.config.ts',
      'payload.config.ts',
      'src',
    ]) {
      copy(entry)
    }

    if (existsSync(path.join(root, 'public'))) copy('public')

    // --ignore-scripts: the root `prepare` script (lefthook) is a devDependency,
    // and every runtime dependency here ships prebuilt binaries.
    run('bun', ['install', '--production', '--frozen-lockfile', '--ignore-scripts'], {
      cwd: out,
    })
  },

  // Everything the Payload job runner needs to load the config, and nothing
  // for the web app (no .next, no app/, no admin UI build output).
  worker: () => {
    for (const entry of [
      'package.json',
      'bun.lock',
      'bunfig.toml',
      'patches',
      'tsconfig.json',
      'payload.config.ts',
      'scripts/start-worker.mjs',
      'scripts/health-server.ts',
      'src',
    ]) {
      copy(entry)
    }

    // --ignore-scripts: the root `prepare` script (lefthook) is a devDependency,
    // and every runtime dependency here ships prebuilt binaries.
    run('bun', ['install', '--production', '--frozen-lockfile', '--ignore-scripts'], {
      cwd: out,
    })
  },

  storybook: () => {
    copy('dist', '.')
  },
}

if (!Object.hasOwn(assemblers, target))
  fail(`unknown target "${target}" (expected web, worker or storybook)`)

rmSync(out, {
  recursive: true,
  force: true,
})

mkdirSync(out, {
  recursive: true,
})

assemblers[target]()

console.info(`[assemble-images] out/${target} ready`)
