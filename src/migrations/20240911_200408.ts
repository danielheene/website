import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_timeline_block_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"employer" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"rich_text" jsonb,
  	"tech" jsonb DEFAULT '[]'::jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_timeline_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_teaser_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_logo_cloud_block_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "pages_blocks_logo_cloud_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_timeline_block_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"employer" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"rich_text" jsonb,
  	"tech" jsonb DEFAULT '[]'::jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_timeline_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_teaser_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" jsonb,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_logo_cloud_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP INDEX IF EXISTS "pages_slug_idx";
  DROP INDEX IF EXISTS "posts_slug_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "sizes_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filename" varchar;
  ALTER TABLE "categories" ADD COLUMN "slug" varchar;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_timeline_block_entries" ADD CONSTRAINT "pages_blocks_timeline_block_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_timeline_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_timeline_block" ADD CONSTRAINT "pages_blocks_timeline_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_teaser_block" ADD CONSTRAINT "pages_blocks_teaser_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_teaser_block" ADD CONSTRAINT "pages_blocks_teaser_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_logo_cloud_block_entries" ADD CONSTRAINT "pages_blocks_logo_cloud_block_entries_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_logo_cloud_block_entries" ADD CONSTRAINT "pages_blocks_logo_cloud_block_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_cloud_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_logo_cloud_block" ADD CONSTRAINT "pages_blocks_logo_cloud_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_timeline_block_entries" ADD CONSTRAINT "_pages_v_blocks_timeline_block_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_timeline_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_timeline_block" ADD CONSTRAINT "_pages_v_blocks_timeline_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_teaser_block" ADD CONSTRAINT "_pages_v_blocks_teaser_block_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_teaser_block" ADD CONSTRAINT "_pages_v_blocks_teaser_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_logo_cloud_block_entries" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_block_entries_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_logo_cloud_block_entries" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_block_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_cloud_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_logo_cloud_block" ADD CONSTRAINT "_pages_v_blocks_logo_cloud_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_timeline_block_entries_order_idx" ON "pages_blocks_timeline_block_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_timeline_block_entries_parent_id_idx" ON "pages_blocks_timeline_block_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_timeline_block_order_idx" ON "pages_blocks_timeline_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_timeline_block_parent_id_idx" ON "pages_blocks_timeline_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_timeline_block_path_idx" ON "pages_blocks_timeline_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_teaser_block_order_idx" ON "pages_blocks_teaser_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_teaser_block_parent_id_idx" ON "pages_blocks_teaser_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_teaser_block_path_idx" ON "pages_blocks_teaser_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "pages_blocks_logo_cloud_block_entries_order_idx" ON "pages_blocks_logo_cloud_block_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_logo_cloud_block_entries_parent_id_idx" ON "pages_blocks_logo_cloud_block_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_logo_cloud_block_order_idx" ON "pages_blocks_logo_cloud_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_logo_cloud_block_parent_id_idx" ON "pages_blocks_logo_cloud_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_logo_cloud_block_path_idx" ON "pages_blocks_logo_cloud_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_timeline_block_entries_order_idx" ON "_pages_v_blocks_timeline_block_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_timeline_block_entries_parent_id_idx" ON "_pages_v_blocks_timeline_block_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_timeline_block_order_idx" ON "_pages_v_blocks_timeline_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_timeline_block_parent_id_idx" ON "_pages_v_blocks_timeline_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_timeline_block_path_idx" ON "_pages_v_blocks_timeline_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_teaser_block_order_idx" ON "_pages_v_blocks_teaser_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_teaser_block_parent_id_idx" ON "_pages_v_blocks_teaser_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_teaser_block_path_idx" ON "_pages_v_blocks_teaser_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_entries_order_idx" ON "_pages_v_blocks_logo_cloud_block_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_entries_parent_id_idx" ON "_pages_v_blocks_logo_cloud_block_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_order_idx" ON "_pages_v_blocks_logo_cloud_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_parent_id_idx" ON "_pages_v_blocks_logo_cloud_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_logo_cloud_block_path_idx" ON "_pages_v_blocks_logo_cloud_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   DROP TABLE "pages_blocks_timeline_block_entries";
  DROP TABLE "pages_blocks_timeline_block";
  DROP TABLE "pages_blocks_teaser_block";
  DROP TABLE "pages_blocks_logo_cloud_block_entries";
  DROP TABLE "pages_blocks_logo_cloud_block";
  DROP TABLE "_pages_v_blocks_timeline_block_entries";
  DROP TABLE "_pages_v_blocks_timeline_block";
  DROP TABLE "_pages_v_blocks_teaser_block";
  DROP TABLE "_pages_v_blocks_logo_cloud_block_entries";
  DROP TABLE "_pages_v_blocks_logo_cloud_block";
  DROP INDEX IF EXISTS "media_sizes_og_sizes_og_filename_idx";
  DROP INDEX IF EXISTS "categories_slug_idx";
  DROP INDEX IF EXISTS "pages_slug_idx";
  DROP INDEX IF EXISTS "posts_slug_idx";
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  CREATE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "posts_slug_idx" ON "posts" USING btree ("slug");
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_width";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_height";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_mime_type";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_filesize";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_og_filename";
  ALTER TABLE "categories" DROP COLUMN IF EXISTS "slug";`)
}
