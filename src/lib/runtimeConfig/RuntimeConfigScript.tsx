import type { JSX } from 'react'

import { readRuntimeConfigFromEnv, serializeRuntimeConfig } from './index'

/**
 * Renders the runtime config ahead of any client code. It is a server
 * component, so under `cacheComponents` its output is produced when the
 * route is prerendered (`next build --experimental-build-mode=generate`)
 * with that build's environment — not when the app was compiled.
 */
export const RuntimeConfigScript = (): JSX.Element => (
  <script
    // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized by serializeRuntimeConfig, which escapes '<'
    dangerouslySetInnerHTML={{
      __html: `window.__RUNTIME_CONFIG__=${serializeRuntimeConfig(readRuntimeConfigFromEnv())}`,
    }}
  />
)
