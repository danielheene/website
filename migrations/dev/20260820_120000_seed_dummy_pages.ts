import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { cleanPages, seedPages } from '@/lib/seed/pages'

/**
 * Bootstraps a handful of sample Pages so a freshly cloned local database
 * isn't an empty shell. Reuses the same `seedPages`/`cleanPages` fixture
 * logic as `pnpm run seed:pages` (see `scripts/seed-pages.ts`) rather than
 * duplicating it — this migration exists only to make that seeding happen
 * automatically for `pnpm run migrate:dev`, not to introduce a second
 * fixture format.
 *
 * Runs only in `migrations/dev/` (opt-in via `MIGRATION_DIR=migrations/dev`,
 * see `payload.config.ts`) — never in `migrations/required/`, and therefore
 * never against production. `seedPages` fetches placeholder images over the
 * network (picsum.photos), which is acceptable for an opt-in local-dev
 * migration but would be the wrong tradeoff anywhere unattended.
 *
 * Idempotent: `seedPages` matches existing seeded pages by slug and skips
 * them, so re-running `migrate:dev` on a database that already has the
 * fixtures is a no-op.
 */
const SEED_COUNT = 5

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await seedPages(payload, SEED_COUNT)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await cleanPages(payload)
}
