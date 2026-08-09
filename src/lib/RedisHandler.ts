import { EventEmitter } from 'node:events'

import { createClient } from 'redis'

export type RedisListener = (message: string) => void

type RedisClient = ReturnType<typeof createClient>

let client: RedisClient | null = null
let clientPromise: Promise<RedisClient> | null = null

let subscriberClient: RedisClient | null = null
let subscriberClientPromise: Promise<RedisClient> | null = null

const emitter = new EventEmitter()
const channelListenerCounts = new Map<string, number>()

/**
 * Lazily creates and connects the shared Redis client used for
 * generic get/set/invalidate operations.
 *
 * Concurrent callers share the same in-flight connection promise so a burst
 * of requests before the first connection settles can't spin up duplicate
 * clients.
 */
export const getClient = async (): Promise<RedisClient> => {
  if (client) return client

  if (!clientPromise) {
    clientPromise = createClient({
      url: process.env.REDIS_URL,
    })
      .on('error', (err) => console.error('Redis Client Error', err))
      .connect()
      .then((connectedClient) => {
        client = connectedClient
        return connectedClient
      })
      .catch((error) => {
        clientPromise = null
        throw error
      })
  }

  return clientPromise
}

/**
 * Reads a cached value and JSON-parses it.
 * Returns `null` when the key is missing or the cached value can't be parsed.
 */
export const get = async <T extends object | string>(key: string): Promise<T | null> => {
  const redis = await getClient()
  const data = await redis.get(key)

  if (!data) return null

  try {
    return JSON.parse(data) as T
  } catch (error) {
    console.error(`Failed to parse cached value for key: ${key}`, error)
    return null
  }
}

/**
 * JSON-stringifies and stores a value, optionally with a TTL in seconds.
 */
export const set = async <T extends object | string>(
  key: string,
  value: T,
  ttlSeconds?: number,
): Promise<void> => {
  const redis = await getClient()
  const stringifiedValue = JSON.stringify(value)

  if (ttlSeconds) {
    await redis.set(key, stringifiedValue, {
      EX: ttlSeconds,
    })
  } else {
    await redis.set(key, stringifiedValue)
  }
}

/**
 * Deletes a cache key. Does not publish any event; use `publish` explicitly
 * if subscribers need to be notified about the invalidation.
 */
export const invalidate = async (key: string): Promise<void> => {
  const redis = await getClient()
  await redis.del(key)
}

/**
 * Lazily creates and connects the dedicated Redis client used for Pub/Sub,
 * kept separate from the general get/set/invalidate client.
 *
 * Concurrent callers share the same in-flight connection promise so a burst
 * of subscribe calls before the first connection settles can't spin up
 * duplicate subscriber clients.
 */
const getSubscriberClient = async (): Promise<RedisClient> => {
  if (subscriberClient) return subscriberClient

  if (!subscriberClientPromise) {
    subscriberClientPromise = getClient()
      .then((baseClient) => {
        const duplicatedClient = baseClient.duplicate()
        duplicatedClient.on('error', (err) => console.error('Redis Subscriber Client Error', err))
        return duplicatedClient.connect()
      })
      .then((connectedClient) => {
        subscriberClient = connectedClient
        return connectedClient
      })
      .catch((error) => {
        subscriberClientPromise = null
        throw error
      })
  }

  return subscriberClientPromise
}

/**
 * Publishes a JSON-stringified message on a Redis Pub/Sub channel.
 */
export const publish = async (channel: string, message: unknown): Promise<void> => {
  const redis = await getClient()
  await redis.publish(channel, JSON.stringify(message))
}

/**
 * Registers a listener for messages on a channel. Ensures the underlying
 * Redis subscriber client is subscribed to the channel exactly once, no
 * matter how many in-process listeners attach to it.
 *
 * Returns an unsubscribe function for convenience.
 */
export const subscribe = async (
  channel: string,
  listener: RedisListener,
): Promise<() => Promise<void>> => {
  const redis = await getSubscriberClient()
  const currentCount = channelListenerCounts.get(channel) ?? 0

  if (currentCount === 0) {
    await redis.subscribe(channel, (message) => {
      emitter.emit(channel, message)
    })
  }

  channelListenerCounts.set(channel, currentCount + 1)
  emitter.on(channel, listener)

  return () => unsubscribe(channel, listener)
}

/**
 * Removes a previously registered listener for a channel. Unsubscribes from
 * Redis once the last listener for that channel is removed.
 */
export const unsubscribe = async (channel: string, listener: RedisListener): Promise<void> => {
  emitter.off(channel, listener)

  const currentCount = channelListenerCounts.get(channel) ?? 0
  const nextCount = Math.max(currentCount - 1, 0)

  if (nextCount === 0) {
    channelListenerCounts.delete(channel)
    const redis = await getSubscriberClient()
    await redis.unsubscribe(channel)
  } else {
    channelListenerCounts.set(channel, nextCount)
  }
}
