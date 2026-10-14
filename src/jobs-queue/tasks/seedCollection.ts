import type { TaskConfig } from 'payload'

import { handlerPath } from '@/jobs-queue/lib/handlerPath'
import { SEEDABLE_COLLECTIONS } from '@/lib/seed/seedableCollection'
import { TaskSlug } from '@/types/jobs-queue'

/**
 * Seeds or cleans fixture data for one collection, chosen by
 * `input.collection`. One task, mode-parameterized, matching the
 * established `AutoTranslateBilingualField` convention (`mode: 'manual' |
 * 'auto'`) rather than a task per collection or per direction.
 *
 * Only used by the admin-panel action (`src/components/AdminPanel/SeedActions`)
 * — the CLI scripts (`scripts/seed-pages.ts`, `scripts/seed-posts.ts`,
 * `scripts/seed-topics.ts`) call each collection's seed/clean functions
 * directly and never touch the jobs queue.
 */

export const seedCollection: TaskConfig<TaskSlug['SeedCollection']> = {
  slug: TaskSlug.SeedCollection,
  label: 'Seed / Clean Collection',
  inputSchema: [
    {
      name: 'collection',
      type: 'text',
      required: true,
      typescriptSchema: [
        () => ({
          type: 'string',
          enum: [...SEEDABLE_COLLECTIONS],
          required: true,
        }),
      ],
    },
    {
      name: 'mode',
      type: 'text',
      required: true,
      typescriptSchema: [
        () => ({
          type: 'string',
          enum: ['seed', 'clean'],
          required: true,
        }),
      ],
    },
    {
      name: 'count',
      type: 'number',
    },
  ],
  handler: handlerPath('seedCollection.ts'),
}
