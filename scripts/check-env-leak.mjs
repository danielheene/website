#!/usr/bin/env node

/**
 *    Fails when the compiled output contains a value from `.env.test`.
 *
 *    The compile is built once with the dummy test values and later deployed
 *    with real ones, so any test value found in `.next` was inlined at build
 *    time and would ship to production. Environment-specific values must be
 *    read at runtime (see src/lib/runtimeConfig).
 *
 *    Usage: node scripts/check-env-leak.mjs [buildDir=.next] [envFile=.env.test]
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const buildDir = process.argv[2] ?? '.next'
const envFile = process.argv[3] ?? '.env.test'

// Values too generic to be meaningful evidence of a leak.
const MIN_LENGTH = 10
// Values that legitimately occur in the output regardless of the environment:
// `localhost:3000` is in `allowedDevOrigins`, and example addresses appear in
// library code.
const IGNORED_KEYS = new Set([
  'S3_REGION',
  'S3_BUCKET',
  'SERVER_HOST',
  'USESEND_DEFAULT_FROM_ADDRESS',
])
const SKIPPED_DIRS = new Set(['cache', 'node_modules', 'diagnostics'])
const BINARY = /\.(node|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|map)$/i

const values = readFileSync(envFile, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => {
    const index = line.indexOf('=')
    return [line.slice(0, index), line.slice(index + 1)]
  })
  .filter(([key, value]) => !IGNORED_KEYS.has(key) && value.length >= MIN_LENGTH)

const leaks = []

const scan = (directory) => {
  for (const entry of readdirSync(directory, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) scan(fullPath)
      continue
    }
    if (!entry.isFile() || BINARY.test(entry.name) || statSync(fullPath).size > 50_000_000) continue

    const content = readFileSync(fullPath, 'utf8')
    for (const [key, value] of values) {
      if (content.includes(value)) leaks.push(`${key} in ${fullPath}`)
    }
  }
}

scan(buildDir)

if (leaks.length > 0) {
  console.error(`[check-env-leak] ${leaks.length} test value(s) found in ${buildDir}:`)
  for (const leak of leaks.slice(0, 50)) console.error(`  - ${leak}`)
  process.exit(1)
}

console.info(`[check-env-leak] ${buildDir} contains none of the ${values.length} checked values`)
