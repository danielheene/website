#!/usr/bin/env node

/**
 *    Assembles the exact files each Docker image contains into `out/<target>`.
 *    The Dockerfile only COPYs these directories: nothing is installed or built
 *    inside an image.
 *
 *    Usage: node scripts/assemble-images.mjs <web|worker|storybook>
 *
 *    web        needs `.next/standalone` (run `next build` compile + generate first)
 *    worker     needs network access to install production dependencies
 *    storybook  needs `dist/` (pnpm run build:storybook)
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

// Tests and stories are never executed in an image.
const NOT_SHIPPED = /\.(test|spec|stories)\.(ts|tsx|mdx)$/

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
  // `output: 'standalone'` traces the server's own dependencies; static assets
  // and public files are not part of the trace and are copied per the Next docs.
  web: () => {
    copy('.next/standalone', '.')
    copy('.next/static', '.next/static')
    if (existsSync(path.join(root, 'public'))) copy('public')
  },

  // Everything the Payload job runner needs to load the config, and nothing
  // for the web app (no .next, no app/, no admin UI build output).
  worker: () => {
    for (const entry of [
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'patches',
      'tsconfig.json',
      'payload.config.ts',
      'scripts/start-worker.mjs',
      'scripts/health-server.ts',
      'src',
    ]) {
      copy(entry)
    }
    // --ignore-scripts: the root `prepare` script (husky) is a devDependency,
    // and every runtime dependency here ships prebuilt binaries.
    run(
      'pnpm',
      [
        'install',
        '--prod',
        '--frozen-lockfile',
        '--ignore-scripts',
      ],
      {
        cwd: out,
      },
    )
  },

  storybook: () => {
    copy('dist', '.')
  },
}

if (!Object.hasOwn(assemblers, target)) fail(`unknown target "${target}" (expected web, worker or storybook)`)

rmSync(out, {
  recursive: true,
  force: true,
})
mkdirSync(out, {
  recursive: true,
})
assemblers[target]()
console.info(`[assemble-images] out/${target} ready`)
