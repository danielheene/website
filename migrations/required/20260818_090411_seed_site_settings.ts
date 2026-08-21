import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { GlobalSlug } from '@/types/globals'

/**
 * Minimum-viable `SiteSettings` bootstrap.
 *
 * `general.*` already ships a full `defaultValue` on the field config and is
 * `required: true`, so Payload populates it on first read without any
 * migration — nothing to do there. `header.mainNavigation.entries` has no
 * such default (`array` fields default to `[]`), so without this migration
 * the header renders with an empty nav on a brand-new database: not broken,
 * but not a usable site either. This migration exists for that one gap.
 *
 * Runs in `migrations/required/` — every environment, including production
 * (see `MIGRATION_DIR` in `payload.config.ts`).
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const siteSettings = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
    depth: 0,
    req,
  })

  const existingEntries = siteSettings.header?.mainNavigation?.entries ?? []

  if (existingEntries.length > 0) {
    // Already has nav entries — a prior run, a manually-edited global, or a
    // restored production DB. Nothing to seed.
    return
  }

  // The afterChange hook revalidates a Next.js cache tag, which requires a
  // static-generation store that doesn't exist when this runs via the
  // standalone `payload migrate` CLI (no Next.js request in flight).
  req.context.skipUpdateCachedData = true

  await payload.updateGlobal({
    slug: GlobalSlug.SiteSettings,
    data: {
      header: {
        mainNavigation: {
          entries: [
            {
              link: {
                label: 'Home',
                url: '/',
              },
            },
          ],
        },
      },
    },
    req,
  })
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const siteSettings = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
    depth: 0,
    req,
  })

  const entries = siteSettings.header?.mainNavigation?.entries ?? []

  // Only remove the exact entry this migration added — an operator may have
  // since added real nav entries alongside it, and `down` must not eat those.
  const isSeededHomeEntry = (entry: {
    link?: {
      label?: string | null
      url?: string | null
    }
  }) => entry.link?.label === 'Home' && entry.link?.url === '/'

  if (!entries.some(isSeededHomeEntry)) return

  req.context.skipUpdateCachedData = true

  await payload.updateGlobal({
    slug: GlobalSlug.SiteSettings,
    data: {
      header: {
        mainNavigation: {
          entries: entries.filter((entry) => !isSeededHomeEntry(entry)),
        },
      },
    },
    req,
  })
}
