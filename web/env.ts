// `@next/env` is a CJS-only package (`"main": "dist/index.js"`, no `"exports"`
// or `"module"` field, `module.exports = <namespace object>`). Its interop shape
// differs depending on who evaluates this file:
//   - Next.js's own config loader (for `next.config.ts`) exposes the named
//     exports directly on the namespace; its synthetic `default` is undefined.
//   - Plain Node ESM (Payload's CLI running `payload.config.ts`) can't statically
//     detect the named exports, so `import { loadEnvConfig }` throws
//     "does not provide an export named 'loadEnvConfig'"; instead the whole CJS
//     exports object shows up as the `default` import.
// A namespace import with a `default` fallback resolves `loadEnvConfig` correctly
// under both interop schemes.
import * as nextEnvNS from '@next/env'
import path from 'node:path'

const nextEnv = (nextEnvNS as unknown as { default?: typeof nextEnvNS }).default ?? nextEnvNS
const { loadEnvConfig } = nextEnv

export function loadRootEnv(dir: string) {
  // `loadEnvConfig(dir, dev, log, forceReload)` caches its result in module-level
  // state and short-circuits every call after the first unless `forceReload` is
  // `true`. Next.js's bootstrap already primes that cache with an empty result
  // for the app's own directory (`web/`, which has no `.env*` files) before
  // `next.config.ts` runs, so without `forceReload: true` this call would return
  // the cached empty result instead of reading the repo-root env files.
  loadEnvConfig(path.resolve(dir, '..'), undefined, undefined, true)
}
