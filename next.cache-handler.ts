import { getRedisCacheComponentsHandler } from '@trieb.work/nextjs-turbo-redis-cache'
import { millisecondsInDay, millisecondsInMinute } from 'date-fns/constants'

/**
 * Redis-backed cache handler for Cache Components.
 *
 * Next exposes two different extension points, and they are not interchangeable:
 *
 * - `cacheHandler` (singular) is the legacy ISR / `unstable_cache` handler.
 * - `cacheHandlers` (plural, `{ default, remote, static }`) is what `use cache`
 *   entries go through, and is the one this project needs — `cacheComponents`
 *   is enabled, so every `'use cache'` function resolves here.
 *
 * `cacheHandlers` takes module paths rather than instances, so this module
 * default-exports the handler itself.
 *
 * Entries survive restarts and are shared across instances, which is the point:
 * a cold instance serves what a warm one already fetched.
 *
 * ## Which Redis database this uses
 *
 * DB 1, and that is not configurable from here.
 *
 * The package builds its singleton at import time — `CacheComponentsHandler.ts`
 * ends with `export const redisCacheHandler = getRedisCacheComponentsHandler()`,
 * an argument-less call that fills the singleton before any configured call can
 * run. Every later `getRedisCacheComponentsHandler(options)` returns that same
 * instance and silently discards the options, so the database resolves to the
 * package default (`VERCEL_ENV === 'production' ? 0 : 1`) — DB 1 off Vercel.
 *
 * That suits this project: Payload's KV adapter (`payload.config.ts`) keeps its
 * `payload-kv:*` keys in DB 0, so the two never share a keyspace. The options
 * below are kept because they document the intended tuning and take effect if
 * the package ever stops pre-building its singleton — but do not expect a
 * change here to move anything today. Verify against Redis if it matters:
 * `redis-cli -n 1 --scan`.
 *
 * Requires `notify-keyspace-events Exe` on the server (see docker-compose.yml):
 * the handler subscribes to `__keyevent@<db>__` notifications to keep its tag
 * manifest in sync, and refuses to start without them.
 */
export default getRedisCacheComponentsHandler({
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'test',
  getTimeoutMs: process.env.REDIS_TIMEOUT_MS
    ? Number.parseInt(process.env.REDIS_TIMEOUT_MS, 10)
    : 2000,
  revalidateTagQuerySize: 500,
  sharedTagsKey: '__sharedTags__',
  avgResyncIntervalMs: millisecondsInMinute * 30,
  redisGetDeduplication: true,
  inMemoryCachingTime: millisecondsInMinute,
  redisUrl: process.env.REDIS_URL,
  defaultStaleAge: millisecondsInDay * 14,
  estimateExpireAge: (staleAge) => staleAge * 2,
})
