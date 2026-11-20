import type { TaskHandler } from 'payload'

import { rebuildRouteIndex } from '@/lib/routeIndex/routeIndexStore'
import { TaskSlug } from '@/types/jobs-queue'

const run: TaskHandler<TaskSlug['BuildRouteIndex']> = async ({ req }) => {
  const index = await rebuildRouteIndex(req.payload)

  return {
    output: {
      paths: Object.keys(index).length,
    },
  }
}

export const handler = run
