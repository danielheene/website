import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN "blur_hash" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_url" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_width" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_height" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_mime_type" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_filesize" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_thumbnail_filename" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_url" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_width" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_height" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_mime_type" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_filesize" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_landscape_filename" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_url" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_width" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_height" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_mime_type" varchar;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_filesize" numeric;
    ALTER TABLE "media"
      ADD COLUMN "sizes_portrait_filename" varchar;
    CREATE INDEX IF NOT EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
    CREATE INDEX IF NOT EXISTS "media_sizes_landscape_sizes_landscape_filename_idx" ON "media" USING btree ("sizes_landscape_filename");
    CREATE INDEX IF NOT EXISTS "media_sizes_portrait_sizes_portrait_filename_idx" ON "media" USING btree ("sizes_portrait_filename");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
    DROP INDEX IF EXISTS "media_sizes_landscape_sizes_landscape_filename_idx";
    DROP INDEX IF EXISTS "media_sizes_portrait_sizes_portrait_filename_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "blur_hash";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_landscape_filename";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_url";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_width";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_height";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_mime_type";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_filesize";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_portrait_filename";`)
}
