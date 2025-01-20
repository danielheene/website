import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DO
    $$
    BEGIN
    CREATE TYPE "public"."_locales" AS ENUM('en');
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "blog_posts_locales"
    (
      "meta_title"
      varchar,
      "meta_image_id"
      integer,
      "meta_description"
      varchar,
      "id"
      serial
      PRIMARY
      KEY
      NOT
      NULL,
      "_locale"
      "_locales"
      NOT
      NULL,
      "_parent_id"
      integer
      NOT
      NULL,
      CONSTRAINT
      "blog_posts_locales_locale_parent_id_unique"
      UNIQUE
    (
      "_locale",
      "_parent_id"
    )
      );

    CREATE TABLE IF NOT EXISTS "_blog_posts_v_locales"
    (
      "version_meta_title"
      varchar,
      "version_meta_image_id"
      integer,
      "version_meta_description"
      varchar,
      "id"
      serial
      PRIMARY
      KEY
      NOT
      NULL,
      "_locale"
      "_locales"
      NOT
      NULL,
      "_parent_id"
      integer
      NOT
      NULL,
      CONSTRAINT
      "_blog_posts_v_locales_locale_parent_id_unique"
      UNIQUE
    (
      "_locale",
      "_parent_id"
    )
      );

    CREATE TABLE IF NOT EXISTS "pages_locales"
    (
      "meta_title"
      varchar,
      "meta_image_id"
      integer,
      "meta_description"
      varchar,
      "id"
      serial
      PRIMARY
      KEY
      NOT
      NULL,
      "_locale"
      "_locales"
      NOT
      NULL,
      "_parent_id"
      integer
      NOT
      NULL,
      CONSTRAINT
      "pages_locales_locale_parent_id_unique"
      UNIQUE
    (
      "_locale",
      "_parent_id"
    )
      );

    CREATE TABLE IF NOT EXISTS "_pages_v_locales"
    (
      "version_meta_title"
      varchar,
      "version_meta_image_id"
      integer,
      "version_meta_description"
      varchar,
      "id"
      serial
      PRIMARY
      KEY
      NOT
      NULL,
      "_locale"
      "_locales"
      NOT
      NULL,
      "_parent_id"
      integer
      NOT
      NULL,
      CONSTRAINT
      "_pages_v_locales_locale_parent_id_unique"
      UNIQUE
    (
      "_locale",
      "_parent_id"
    )
      );

    ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_meta_image_id_media_id_fk";

    ALTER TABLE "_blog_posts_v" DROP CONSTRAINT "_blog_posts_v_version_meta_image_id_media_id_fk";

    ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";

    ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";

    ALTER TABLE "users"
      ADD COLUMN "name" varchar;
    DO
    $$
    BEGIN
    ALTER TABLE "blog_posts_locales"
      ADD CONSTRAINT "blog_posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "blog_posts_locales"
      ADD CONSTRAINT "blog_posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_blog_posts_v_locales"
      ADD CONSTRAINT "_blog_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_blog_posts_v_locales"
      ADD CONSTRAINT "_blog_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v" ("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "pages_locales"
      ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "pages_locales"
      ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages" ("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_pages_v_locales"
      ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_pages_v_locales"
      ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v" ("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_image_id";
    ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "_blog_posts_v" DROP COLUMN IF EXISTS "version_meta_title";
    ALTER TABLE "_blog_posts_v" DROP COLUMN IF EXISTS "version_meta_image_id";
    ALTER TABLE "_blog_posts_v" DROP COLUMN IF EXISTS "version_meta_description";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_title";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_image_id";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "meta_description";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_title";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_image_id";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_meta_description";`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE "blog_posts_locales";
    DROP TABLE "_blog_posts_v_locales";
    DROP TABLE "pages_locales";
    DROP TABLE "_pages_v_locales";
    ALTER TABLE "blog_posts"
      ADD COLUMN "meta_title" varchar;
    ALTER TABLE "blog_posts"
      ADD COLUMN "meta_image_id" integer;
    ALTER TABLE "blog_posts"
      ADD COLUMN "meta_description" varchar;
    ALTER TABLE "_blog_posts_v"
      ADD COLUMN "version_meta_title" varchar;
    ALTER TABLE "_blog_posts_v"
      ADD COLUMN "version_meta_image_id" integer;
    ALTER TABLE "_blog_posts_v"
      ADD COLUMN "version_meta_description" varchar;
    ALTER TABLE "pages"
      ADD COLUMN "meta_title" varchar;
    ALTER TABLE "pages"
      ADD COLUMN "meta_image_id" integer;
    ALTER TABLE "pages"
      ADD COLUMN "meta_description" varchar;
    ALTER TABLE "_pages_v"
      ADD COLUMN "version_meta_title" varchar;
    ALTER TABLE "_pages_v"
      ADD COLUMN "version_meta_image_id" integer;
    ALTER TABLE "_pages_v"
      ADD COLUMN "version_meta_description" varchar;
    DO
    $$
    BEGIN
    ALTER TABLE "blog_posts"
      ADD CONSTRAINT "blog_posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_blog_posts_v"
      ADD CONSTRAINT "_blog_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "pages"
      ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

  DO
    $$
    BEGIN
    ALTER TABLE "_pages_v"
      ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
   WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "users" DROP COLUMN IF EXISTS "name";`)
}
