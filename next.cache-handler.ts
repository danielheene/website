import { RedisStringsHandler } from '@trieb.work/nextjs-turbo-redis-cache'
import { millisecondsInDay, millisecondsInMinute } from 'date-fns/constants'

let cachedHandler: RedisStringsHandler

export default class CustomizedCacheHandler {
  constructor() {
    if (!cachedHandler) {
      cachedHandler = new RedisStringsHandler({
        database: process.env.REDIS_DATABASE ? Number.parseInt(process.env.REDIS_DATABASE, 10) : 0,
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
    }
  }
  get(...args: Parameters<RedisStringsHandler['get']>) {
    return cachedHandler.get(...args)
  }
  set(...args: Parameters<RedisStringsHandler['set']>) {
    return cachedHandler.set(...args)
  }
  revalidateTag(...args: Parameters<RedisStringsHandler['revalidateTag']>) {
    return cachedHandler.revalidateTag(...args)
  }
  resetRequestCache(...args: Parameters<RedisStringsHandler['resetRequestCache']>) {
    return cachedHandler.resetRequestCache(...args)
  }
}
