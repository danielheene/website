import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

import { GlobalSlug } from '@/types/globals'

export async function up({ payload, req, session }: MigrateUpArgs): Promise<void> {
  // Migration code

  const settings = await payload.findGlobal({
    slug: GlobalSlug.SiteSettings,
  })
}

export async function down({ payload, req, session }: MigrateDownArgs): Promise<void> {
  // Migration code
}
