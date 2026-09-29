#!/usr/bin/env node

/**
 *    Resets the shared Testing services before an E2E run: rebuilds Mongo and
 *    Redis through Dokploy, then makes sure they (and the S3 bucket) are empty.
 *
 *    The rebuild gives fresh containers; the follow-up reset (`dropDatabase`,
 *    `FLUSHALL`, `aws s3 rm`) is what guarantees emptiness even if a rebuild
 *    returns before the new container serves traffic. Set
 *    DOKPLOY_REBUILD=false to skip the rebuild and only empty the services.
 *
 *    Guard: refuses to touch anything unless every service hostname is listed
 *    in TEST_SERVICES_HOST (comma-separated), so a wrong secret can never
 *    reset a production service.
 *
 *    Requires: DATABASE_URL, REDIS_URL, S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY,
 *    S3_SECRET_KEY, S3_REGION, TEST_SERVICES_HOST and, unless rebuilding is
 *    skipped, DOKPLOY_URL, DOKPLOY_API_KEY, DOKPLOY_MONGO_ID, DOKPLOY_REDIS_ID.
 *    Uses Docker (mongosh) and the AWS CLI, both preinstalled on GitHub runners.
 */

import { spawnSync } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

import { createClient } from 'redis'

const READY_TIMEOUT_MS = 180_000
const POLL_INTERVAL_MS = 5_000
const REBUILD_SETTLE_MS = 10_000

const fail = (message) => {
  console.error(`[reset-test-services] ${message}`)
  process.exit(1)
}

const need = (name) => process.env[name] || fail(`${name} is not set`)

const hostOf = (value) => {
  try {
    return new URL(value).hostname
  } catch {
    return fail('a service URL is not a valid URL')
  }
}

const databaseUrl = need('DATABASE_URL')
const redisUrl = need('REDIS_URL')
const s3Endpoint = need('S3_ENDPOINT')
const s3Bucket = need('S3_BUCKET')
const allowed = need('TEST_SERVICES_HOST')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

for (const [name, value] of [
  [
    'DATABASE_URL',
    databaseUrl,
  ],
  [
    'REDIS_URL',
    redisUrl,
  ],
  [
    'S3_ENDPOINT',
    s3Endpoint,
  ],
]) {
  if (!allowed.includes(hostOf(value))) {
    fail(`${name} does not point at an allowed test host; refusing to reset anything`)
  }
}

const rebuild = async (service, idName) => {
  const base = need('DOKPLOY_URL').replace(/\/$/, '')
  const body = JSON.stringify({
    [`${service}Id`]: need(idName),
  })
  const headers = {
    'content-type': 'application/json',
    'x-api-key': need('DOKPLOY_API_KEY'),
  }

  // Dokploy documents both `/api/mongo.rebuild` and `/api/mongo/rebuild`.
  for (const url of [
    `${base}/api/${service}.rebuild`,
    `${base}/api/${service}/rebuild`,
  ]) {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
    if (response.ok) {
      console.info(`[reset-test-services] ${service} rebuild requested`)
      return
    }
    if (response.status !== 404) fail(`${service} rebuild failed: HTTP ${response.status}`)
  }
  fail(`${service} rebuild endpoint not found`)
}

const retryUntilReady = async (label, attempt) => {
  const deadline = Date.now() + READY_TIMEOUT_MS
  let lastError
  while (Date.now() < deadline) {
    try {
      await attempt()
      return
    } catch (error) {
      lastError = error
      await sleep(POLL_INTERVAL_MS)
    }
  }
  fail(`${label} not ready in time: ${lastError?.message ?? lastError}`)
}

const dropMongoDatabase = () => {
  const result = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '--network',
      'host',
      'mongo:8',
      'mongosh',
      databaseUrl,
      '--quiet',
      '--eval',
      'db.dropDatabase().ok',
    ],
    {
      encoding: 'utf8',
    },
  )
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'mongosh failed')
}

const flushRedis = async () => {
  const client = createClient({
    url: redisUrl,
  })
  client.on('error', () => {})
  try {
    await client.connect()
    await client.flushAll()
    const size = await client.dbSize()
    if (size !== 0) throw new Error(`Redis still holds ${size} keys after FLUSHALL`)
  } finally {
    await client.destroy().catch(() => {})
  }
}

const emptyBucket = () => {
  const result = spawnSync(
    'aws',
    [
      's3',
      'rm',
      `s3://${s3Bucket}`,
      '--recursive',
      '--endpoint-url',
      s3Endpoint,
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        AWS_ACCESS_KEY_ID: need('S3_ACCESS_KEY'),
        AWS_SECRET_ACCESS_KEY: need('S3_SECRET_KEY'),
        AWS_DEFAULT_REGION: need('S3_REGION'),
      },
    },
  )
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'aws s3 rm failed')
}

if (process.env.DOKPLOY_REBUILD !== 'false') {
  await Promise.all([
    rebuild('mongo', 'DOKPLOY_MONGO_ID'),
    rebuild('redis', 'DOKPLOY_REDIS_ID'),
  ])
  await sleep(REBUILD_SETTLE_MS)
}

await Promise.all([
  retryUntilReady('Mongo', async () => dropMongoDatabase()),
  retryUntilReady('Redis', flushRedis),
  retryUntilReady('S3', async () => emptyBucket()),
])

console.info('[reset-test-services] Mongo, Redis and S3 are empty')
