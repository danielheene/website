import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-mongodb'

/**
 * Recomputed blog post excerpts still stored as rich text into the plain text
 * the excerpt field held at the time.
 *
 * Superseded by `00000005_manual_rich_text_excerpts`: excerpts are rich text
 * again, written by hand, so a rich-text excerpt this migration would have
 * flattened is now a valid value and is kept as it is. Databases that already
 * ran it have their plain-text excerpts converted by 00000005.
 */
export async function up(_args: MigrateUpArgs): Promise<void> {}

export async function down(_args: MigrateDownArgs): Promise<void> {}
