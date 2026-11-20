import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { getClient } from '@/lib/RedisHandler'

import { buildRouteIndex, type RouteEntry, type RouteIndex } from './buildRouteIndex'

const INDEX_KEY = 'route-index'

/**
 * Written only by a full build. A hook edit on a missing index creates the
 * hash without it, and such a partial hash counts as missing, so it is rebuilt
 * instead of 404ing every other path.
 */
const BUILT_FIELD = '__built'

// SAFETY: every field but BUILT_FIELD is written by this module from a RouteEntry.
const parseIndex = (hash: Record<string, string>): RouteIndex =>
  Object.fromEntries(
    Object.entries(hash)
      .filter(([path]) => path !== BUILT_FIELD)
      .map(([path, value]) => [path, JSON.parse(value) as RouteEntry]),
  )

/**
 * Replaces the stored index in one step: written to a temporary key, then
 * renamed over the live one, so readers never see a half-written index.
 */
const writeRouteIndex = async (index: RouteIndex): Promise<void> => {
  const redis = await getClient()
  const temporaryKey = `${INDEX_KEY}:building:${crypto.randomUUID()}`

  await redis.hSet(temporaryKey, {
    ...Object.fromEntries(
      Object.entries(index).map(([path, entry]) => [path, JSON.stringify(entry)]),
    ),
    [BUILT_FIELD]: new Date().toISOString(),
  })
  await redis.rename(temporaryKey, INDEX_KEY)
}

let pendingBuild: Promise<RouteIndex> | null = null

/**
 * Builds the index from the database and stores it. Concurrent callers in one
 * process share a single build, so a cold start doesn't run one per request.
 */
export const rebuildRouteIndex = (payload?: Payload): Promise<RouteIndex> => {
  pendingBuild ??= (async () => {
    try {
      const index = await buildRouteIndex(payload ?? (await getPayload({ config })))

      await writeRouteIndex(index)

      return index
    } finally {
      pendingBuild = null
    }
  })()

  return pendingBuild
}

/** The stored index, built first when Redis has none. */
export const getRouteIndex = async (): Promise<RouteIndex> => {
  const redis = await getClient()
  const hash = await redis.hGetAll(INDEX_KEY)

  return hash[BUILT_FIELD] ? parseIndex(hash) : rebuildRouteIndex()
}

/** Whether the frontend serves `path`, building the index first when Redis has none. */
export const hasRoute = async (path: string): Promise<boolean> => {
  const redis = await getClient()
  const [built, entry] = await redis.hmGet(INDEX_KEY, [BUILT_FIELD, path])

  if (!built) return path in (await rebuildRouteIndex())

  return entry !== null
}

/**
 * Adds a path unless it is already listed: a save knows that its path exists,
 * not its sitemap metadata, which the queued full build keeps for listed paths.
 */
export const addRoute = async (path: string, entry: RouteEntry): Promise<void> => {
  const redis = await getClient()

  await redis.hSetNX(INDEX_KEY, path, JSON.stringify(entry))
}

export const removeRoute = async (path: string): Promise<void> => {
  const redis = await getClient()

  await redis.hDel(INDEX_KEY, path)
}
