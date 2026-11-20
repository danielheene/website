import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Rebuilds the route index behind the sitemap and the proxy's 404s. One
 * concurrency key: a newer queued build replaces one that hasn't started, and
 * builds never overlap.
 */
export const buildRouteIndex: TaskConfig<TaskSlug['BuildRouteIndex']> = {
  slug: TaskSlug.BuildRouteIndex,
  label: 'Build Route Index',
  retries: 2,
  concurrency: {
    key: () => TaskSlug.BuildRouteIndex,
    supersedes: true,
    exclusive: true,
  },
  outputSchema: [
    {
      name: 'paths',
      type: 'number',
    },
  ],
  handler: handlerPath('buildRouteIndex.ts'),
}
