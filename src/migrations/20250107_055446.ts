import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
      DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_hero_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_hero_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_about_me_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_about_me_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_experience_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_experience_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_projects_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_projects_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_customers_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_customers_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_resume_contact_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__resume_contact_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_settings_navigation_header_nav_items_link_type" AS ENUM('reference', 'custom');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_settings_navigation_footer_nav_items_link_type" AS ENUM('reference', 'custom');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_settings_navigation_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__settings_navigation_v_version_header_nav_items_link_type" AS ENUM('reference', 'custom');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__settings_navigation_v_version_footer_nav_items_link_type" AS ENUM('reference', 'custom');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__settings_navigation_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum_settings_meta_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      CREATE TYPE "public"."enum__settings_meta_v_version_status" AS ENUM('draft', 'published');
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS "blog_categories"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar
          NOT
          NULL,
          "slug"
          varchar,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL
          );

      CREATE TABLE IF NOT EXISTS "blog_tags"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar
          NOT
          NULL,
          "slug"
          varchar,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL
          );

      CREATE TABLE IF NOT EXISTS "blog_posts_populated_authors"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "name"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "blog_posts"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "content"
          jsonb,
          "meta_title"
          varchar,
          "meta_image_id"
          integer,
          "meta_description"
          varchar,
          "published_at"
          timestamp
      (
          3
      ) with time zone,
            "slug" varchar,
            "updated_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "_status" "enum_blog_posts_status" DEFAULT 'draft'
          );

      CREATE TABLE IF NOT EXISTS "blog_posts_rels"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "order"
          integer,
          "parent_id"
          integer
          NOT
          NULL,
          "path"
          varchar
          NOT
          NULL,
          "blog_posts_id"
          integer,
          "blog_categories_id"
          integer,
          "users_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "_blog_posts_v_version_populated_authors"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "_uuid"
          varchar,
          "name"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "_blog_posts_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "parent_id"
          integer,
          "version_title"
          varchar,
          "version_content"
          jsonb,
          "version_meta_title"
          varchar,
          "version_meta_image_id"
          integer,
          "version_meta_description"
          varchar,
          "version_published_at"
          timestamp
      (
          3
      ) with time zone,
            "version_slug" varchar,
            "version_updated_at" timestamp (3)
        with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean,
          "autosave" boolean
          );

      CREATE TABLE IF NOT EXISTS "_blog_posts_v_rels"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "order"
          integer,
          "parent_id"
          integer
          NOT
          NULL,
          "path"
          varchar
          NOT
          NULL,
          "blog_posts_id"
          integer,
          "blog_categories_id"
          integer,
          "users_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "media"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "alt"
          varchar,
          "brightness"
          numeric,
          "palette"
          jsonb,
          "type"
          varchar,
          "extension"
          varchar,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "url" varchar,
          "thumbnail_u_r_l" varchar,
          "filename" varchar,
          "mime_type" varchar,
          "filesize" numeric,
          "width" numeric,
          "height" numeric,
          "focal_x" numeric,
          "focal_y" numeric
          );

      CREATE TABLE IF NOT EXISTS "pages"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "hero_id"
          integer,
          "content"
          jsonb,
          "meta_title"
          varchar,
          "meta_image_id"
          integer,
          "meta_description"
          varchar,
          "published_at"
          timestamp
      (
          3
      ) with time zone,
            "slug" varchar,
            "updated_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "_status" "enum_pages_status" DEFAULT 'draft'
          );

      CREATE TABLE IF NOT EXISTS "_pages_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "parent_id"
          integer,
          "version_title"
          varchar,
          "version_hero_id"
          integer,
          "version_content"
          jsonb,
          "version_meta_title"
          varchar,
          "version_meta_image_id"
          integer,
          "version_meta_description"
          varchar,
          "version_published_at"
          timestamp
      (
          3
      ) with time zone,
            "version_slug" varchar,
            "version_updated_at" timestamp (3)
        with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "version__status" "enum__pages_v_version_status" DEFAULT 'draft',
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean,
          "autosave" boolean
          );

      CREATE TABLE IF NOT EXISTS "users"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "email" varchar NOT NULL,
          "reset_password_token" varchar,
          "reset_password_expiration" timestamp
      (
          3
      )
        with time zone,
            "salt" varchar,
            "hash" varchar,
            "login_attempts" numeric DEFAULT 0,
            "lock_until" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "payload_preferences"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "key"
          varchar,
          "value"
          jsonb,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL
          );

      CREATE TABLE IF NOT EXISTS "payload_preferences_rels"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "order"
          integer,
          "parent_id"
          integer
          NOT
          NULL,
          "path"
          varchar
          NOT
          NULL,
          "users_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "payload_migrations"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "name"
          varchar,
          "batch"
          numeric,
          "updated_at"
          timestamp
      (
          3
      ) with time zone DEFAULT now() NOT NULL,
          "created_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL
          );

      CREATE TABLE IF NOT EXISTS "resume_hero"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "background_id"
          integer,
          "portrait_id"
          integer,
          "title"
          varchar,
          "caption"
          jsonb,
          "_status"
          "enum_resume_hero_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_hero_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_background_id"
          integer,
          "version_portrait_id"
          integer,
          "version_title"
          varchar,
          "version_caption"
          jsonb,
          "version__status"
          "enum__resume_hero_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "resume_about_me"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "portrait_id"
          integer,
          "title"
          varchar,
          "content"
          jsonb,
          "anchor"
          varchar,
          "_status"
          "enum_resume_about_me_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_about_me_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_portrait_id"
          integer,
          "version_title"
          varchar,
          "version_content"
          jsonb,
          "version_anchor"
          varchar,
          "version__status"
          "enum__resume_about_me_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "resume_experience_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "employer"
          varchar,
          "start_date"
          timestamp
      (
          3
      ) with time zone,
            "end_date" timestamp (3)
        with time zone,
            "rich_text" jsonb,
            "technologies" jsonb DEFAULT '[]'::jsonb
            );

      CREATE TABLE IF NOT EXISTS "resume_experience"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "caption"
          jsonb,
          "anchor"
          varchar,
          "_status"
          "enum_resume_experience_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_experience_v_version_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "employer"
          varchar,
          "start_date"
          timestamp
      (
          3
      ) with time zone,
            "end_date" timestamp (3)
        with time zone,
            "rich_text" jsonb,
            "technologies" jsonb DEFAULT '[]'::jsonb,
            "_uuid" varchar
            );

      CREATE TABLE IF NOT EXISTS "_resume_experience_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_title"
          varchar,
          "version_caption"
          jsonb,
          "version_anchor"
          varchar,
          "version__status"
          "enum__resume_experience_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "resume_projects_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "headline"
          varchar,
          "subline"
          varchar,
          "rich_text"
          jsonb,
          "image_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "resume_projects"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "caption"
          jsonb,
          "anchor"
          varchar,
          "_status"
          "enum_resume_projects_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_projects_v_version_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "headline"
          varchar,
          "subline"
          varchar,
          "rich_text"
          jsonb,
          "image_id"
          integer,
          "_uuid"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "_resume_projects_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_title"
          varchar,
          "version_caption"
          jsonb,
          "version_anchor"
          varchar,
          "version__status"
          "enum__resume_projects_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "resume_customers_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "logo"
          varchar,
          "title"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "resume_customers"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "caption"
          jsonb,
          "anchor"
          varchar,
          "_status"
          "enum_resume_customers_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_customers_v_version_entries"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "logo"
          varchar,
          "title"
          varchar,
          "_uuid"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "_resume_customers_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_title"
          varchar,
          "version_caption"
          jsonb,
          "version_anchor"
          varchar,
          "version__status"
          "enum__resume_customers_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "resume_contact"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "title"
          varchar,
          "caption"
          jsonb,
          "button_label"
          varchar,
          "button_mail_to"
          varchar,
          "anchor"
          varchar,
          "_status"
          "enum_resume_contact_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_resume_contact_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_title"
          varchar,
          "version_caption"
          jsonb,
          "version_button_label"
          varchar,
          "version_button_mail_to"
          varchar,
          "version_anchor"
          varchar,
          "version__status"
          "enum__resume_contact_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "settings_navigation_header_nav_items"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "link_type"
          "enum_settings_navigation_header_nav_items_link_type"
          DEFAULT
          'reference',
          "link_new_tab"
          boolean,
          "link_url"
          varchar,
          "link_label"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "settings_navigation_footer_nav_items"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          varchar
          PRIMARY
          KEY
          NOT
          NULL,
          "link_type"
          "enum_settings_navigation_footer_nav_items_link_type"
          DEFAULT
          'reference',
          "link_new_tab"
          boolean,
          "link_url"
          varchar,
          "link_label"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "settings_navigation"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "_status"
          "enum_settings_navigation_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "settings_navigation_rels"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "order"
          integer,
          "parent_id"
          integer
          NOT
          NULL,
          "path"
          varchar
          NOT
          NULL,
          "pages_id"
          integer,
          "blog_posts_id"
          integer,
          "blog_categories_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "_settings_navigation_v_version_header_nav_items"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "link_type"
          "enum__settings_navigation_v_version_header_nav_items_link_type"
          DEFAULT
          'reference',
          "link_new_tab"
          boolean,
          "link_url"
          varchar,
          "link_label"
          varchar,
          "_uuid"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items"
      (
          "_order"
          integer
          NOT
          NULL,
          "_parent_id"
          integer
          NOT
          NULL,
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "link_type"
          "enum__settings_navigation_v_version_footer_nav_items_link_type"
          DEFAULT
          'reference',
          "link_new_tab"
          boolean,
          "link_url"
          varchar,
          "link_label"
          varchar,
          "_uuid"
          varchar
      );

      CREATE TABLE IF NOT EXISTS "_settings_navigation_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version__status"
          "enum__settings_navigation_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      CREATE TABLE IF NOT EXISTS "_settings_navigation_v_rels"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "order"
          integer,
          "parent_id"
          integer
          NOT
          NULL,
          "path"
          varchar
          NOT
          NULL,
          "pages_id"
          integer,
          "blog_posts_id"
          integer,
          "blog_categories_id"
          integer
      );

      CREATE TABLE IF NOT EXISTS "settings_meta"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "site_name"
          varchar,
          "title_template"
          varchar,
          "fallback_title"
          varchar,
          "fallback_description"
          varchar,
          "fallback_image_id"
          integer,
          "keywords"
          jsonb
          DEFAULT
          '[]'
          :
          :
          jsonb,
          "_status"
          "enum_settings_meta_status"
          DEFAULT
          'draft',
          "updated_at"
          timestamp
      (
          3
      ) with time zone,
            "created_at" timestamp (3)
        with time zone
            );

      CREATE TABLE IF NOT EXISTS "_settings_meta_v"
      (
          "id"
          serial
          PRIMARY
          KEY
          NOT
          NULL,
          "version_site_name"
          varchar,
          "version_title_template"
          varchar,
          "version_fallback_title"
          varchar,
          "version_fallback_description"
          varchar,
          "version_fallback_image_id"
          integer,
          "version_keywords"
          jsonb
          DEFAULT
          '[]'
          :
          :
          jsonb,
          "version__status"
          "enum__settings_meta_v_version_status"
          DEFAULT
          'draft',
          "version_updated_at"
          timestamp
      (
          3
      ) with time zone,
            "version_created_at" timestamp (3)
        with time zone,
            "created_at" timestamp (3)
        with time zone DEFAULT now() NOT NULL,
          "updated_at" timestamp
      (
          3
      )
        with time zone DEFAULT now() NOT NULL,
          "latest" boolean
          );

      DO
      $$
      BEGIN
      ALTER TABLE "blog_posts_populated_authors"
          ADD CONSTRAINT "blog_posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

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
      ALTER TABLE "blog_posts_rels"
          ADD CONSTRAINT "blog_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "blog_posts_rels"
          ADD CONSTRAINT "blog_posts_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "blog_posts_rels"
          ADD CONSTRAINT "blog_posts_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "blog_posts_rels"
          ADD CONSTRAINT "blog_posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_blog_posts_v_version_populated_authors"
          ADD CONSTRAINT "_blog_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_blog_posts_v"
          ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts" ("id") ON DELETE set null ON UPDATE no action;
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
      ALTER TABLE "_blog_posts_v_rels"
          ADD CONSTRAINT "_blog_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blog_posts_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_blog_posts_v_rels"
          ADD CONSTRAINT "_blog_posts_v_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_blog_posts_v_rels"
          ADD CONSTRAINT "_blog_posts_v_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_blog_posts_v_rels"
          ADD CONSTRAINT "_blog_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "pages"
          ADD CONSTRAINT "pages_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
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
          ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_pages_v"
          ADD CONSTRAINT "_pages_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
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

  DO
      $$
      BEGIN
      ALTER TABLE "payload_preferences_rels"
          ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "payload_preferences_rels"
          ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_hero"
          ADD CONSTRAINT "resume_hero_background_id_media_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_hero"
          ADD CONSTRAINT "resume_hero_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_hero_v"
          ADD CONSTRAINT "_resume_hero_v_version_background_id_media_id_fk" FOREIGN KEY ("version_background_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_hero_v"
          ADD CONSTRAINT "_resume_hero_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_about_me"
          ADD CONSTRAINT "resume_about_me_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_about_me_v"
          ADD CONSTRAINT "_resume_about_me_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_experience_entries"
          ADD CONSTRAINT "resume_experience_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_experience" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_experience_v_version_entries"
          ADD CONSTRAINT "_resume_experience_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_experience_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_projects_entries"
          ADD CONSTRAINT "resume_projects_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_projects_entries"
          ADD CONSTRAINT "resume_projects_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_projects" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_projects_v_version_entries"
          ADD CONSTRAINT "_resume_projects_v_version_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_projects_v_version_entries"
          ADD CONSTRAINT "_resume_projects_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_projects_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "resume_customers_entries"
          ADD CONSTRAINT "resume_customers_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_customers" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_resume_customers_v_version_entries"
          ADD CONSTRAINT "_resume_customers_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_customers_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_header_nav_items"
          ADD CONSTRAINT "settings_navigation_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_navigation" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_footer_nav_items"
          ADD CONSTRAINT "settings_navigation_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_navigation" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_rels"
          ADD CONSTRAINT "settings_navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."settings_navigation" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_rels"
          ADD CONSTRAINT "settings_navigation_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_rels"
          ADD CONSTRAINT "settings_navigation_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_navigation_rels"
          ADD CONSTRAINT "settings_navigation_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_version_header_nav_items"
          ADD CONSTRAINT "_settings_navigation_v_version_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_navigation_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_version_footer_nav_items"
          ADD CONSTRAINT "_settings_navigation_v_version_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_navigation_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_rels"
          ADD CONSTRAINT "_settings_navigation_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_settings_navigation_v" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_rels"
          ADD CONSTRAINT "_settings_navigation_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_rels"
          ADD CONSTRAINT "_settings_navigation_v_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_navigation_v_rels"
          ADD CONSTRAINT "_settings_navigation_v_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories" ("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "settings_meta"
          ADD CONSTRAINT "settings_meta_fallback_image_id_media_id_fk" FOREIGN KEY ("fallback_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

  DO
      $$
      BEGIN
      ALTER TABLE "_settings_meta_v"
          ADD CONSTRAINT "_settings_meta_v_version_fallback_image_id_media_id_fk" FOREIGN KEY ("version_fallback_image_id") REFERENCES "public"."media" ("id") ON DELETE set null ON UPDATE no action;
      EXCEPTION
   WHEN duplicate_object THEN null;
      END $$;

      CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
      CREATE INDEX IF NOT EXISTS "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_idx" ON "blog_tags" USING btree ("slug");
      CREATE INDEX IF NOT EXISTS "blog_tags_created_at_idx" ON "blog_tags" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "blog_posts_populated_authors_order_idx" ON "blog_posts_populated_authors" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "blog_posts_populated_authors_parent_id_idx" ON "blog_posts_populated_authors" USING btree ("_parent_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
      CREATE INDEX IF NOT EXISTS "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "blog_posts_rels_order_idx" ON "blog_posts_rels" USING btree ("order");
      CREATE INDEX IF NOT EXISTS "blog_posts_rels_parent_idx" ON "blog_posts_rels" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "blog_posts_rels_path_idx" ON "blog_posts_rels" USING btree ("path");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_populated_authors_order_idx" ON "_blog_posts_v_version_populated_authors" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_populated_authors_parent_id_idx" ON "_blog_posts_v_version_populated_authors" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_autosave_idx" ON "_blog_posts_v" USING btree ("autosave");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_order_idx" ON "_blog_posts_v_rels" USING btree ("order");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_parent_idx" ON "_blog_posts_v_rels" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_path_idx" ON "_blog_posts_v_rels" USING btree ("path");
      CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
      CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
      CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "pages__status_idx" ON "pages" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
      CREATE INDEX IF NOT EXISTS "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
      CREATE INDEX IF NOT EXISTS "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
      CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
      CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
      CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
      CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
      CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
      CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
      CREATE INDEX IF NOT EXISTS "resume_hero__status_idx" ON "resume_hero" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_hero_v_version_version__status_idx" ON "_resume_hero_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_hero_v_latest_idx" ON "_resume_hero_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "resume_about_me__status_idx" ON "resume_about_me" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_about_me_v_version_version__status_idx" ON "_resume_about_me_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_about_me_v_latest_idx" ON "_resume_about_me_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "resume_experience_entries_order_idx" ON "resume_experience_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "resume_experience_entries_parent_id_idx" ON "resume_experience_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "resume_experience__status_idx" ON "resume_experience" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_entries_order_idx" ON "_resume_experience_v_version_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_entries_parent_id_idx" ON "_resume_experience_v_version_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_version__status_idx" ON "_resume_experience_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_experience_v_latest_idx" ON "_resume_experience_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "resume_projects_entries_order_idx" ON "resume_projects_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "resume_projects_entries_parent_id_idx" ON "resume_projects_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "resume_projects__status_idx" ON "resume_projects" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_entries_order_idx" ON "_resume_projects_v_version_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_entries_parent_id_idx" ON "_resume_projects_v_version_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_version__status_idx" ON "_resume_projects_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_projects_v_latest_idx" ON "_resume_projects_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "resume_customers_entries_order_idx" ON "resume_customers_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "resume_customers_entries_parent_id_idx" ON "resume_customers_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "resume_customers__status_idx" ON "resume_customers" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_entries_order_idx" ON "_resume_customers_v_version_entries" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_entries_parent_id_idx" ON "_resume_customers_v_version_entries" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_version__status_idx" ON "_resume_customers_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_customers_v_latest_idx" ON "_resume_customers_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "resume_contact__status_idx" ON "resume_contact" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_resume_contact_v_version_version__status_idx" ON "_resume_contact_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_resume_contact_v_latest_idx" ON "_resume_contact_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "settings_navigation_header_nav_items_order_idx" ON "settings_navigation_header_nav_items" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "settings_navigation_header_nav_items_parent_id_idx" ON "settings_navigation_header_nav_items" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "settings_navigation_footer_nav_items_order_idx" ON "settings_navigation_footer_nav_items" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "settings_navigation_footer_nav_items_parent_id_idx" ON "settings_navigation_footer_nav_items" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "settings_navigation__status_idx" ON "settings_navigation" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "settings_navigation_rels_order_idx" ON "settings_navigation_rels" USING btree ("order");
      CREATE INDEX IF NOT EXISTS "settings_navigation_rels_parent_idx" ON "settings_navigation_rels" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "settings_navigation_rels_path_idx" ON "settings_navigation_rels" USING btree ("path");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_header_nav_items_order_idx" ON "_settings_navigation_v_version_header_nav_items" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_header_nav_items_parent_id_idx" ON "_settings_navigation_v_version_header_nav_items" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items_order_idx" ON "_settings_navigation_v_version_footer_nav_items" USING btree ("_order");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items_parent_id_idx" ON "_settings_navigation_v_version_footer_nav_items" USING btree ("_parent_id");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_version__status_idx" ON "_settings_navigation_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_latest_idx" ON "_settings_navigation_v" USING btree ("latest");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_order_idx" ON "_settings_navigation_v_rels" USING btree ("order");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_parent_idx" ON "_settings_navigation_v_rels" USING btree ("parent_id");
      CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_path_idx" ON "_settings_navigation_v_rels" USING btree ("path");
      CREATE INDEX IF NOT EXISTS "settings_meta__status_idx" ON "settings_meta" USING btree ("_status");
      CREATE INDEX IF NOT EXISTS "_settings_meta_v_version_version__status_idx" ON "_settings_meta_v" USING btree ("version__status");
      CREATE INDEX IF NOT EXISTS "_settings_meta_v_latest_idx" ON "_settings_meta_v" USING btree ("latest");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
      DROP TABLE "blog_categories";
      DROP TABLE "blog_tags";
      DROP TABLE "blog_posts_populated_authors";
      DROP TABLE "blog_posts";
      DROP TABLE "blog_posts_rels";
      DROP TABLE "_blog_posts_v_version_populated_authors";
      DROP TABLE "_blog_posts_v";
      DROP TABLE "_blog_posts_v_rels";
      DROP TABLE "media";
      DROP TABLE "pages";
      DROP TABLE "_pages_v";
      DROP TABLE "users";
      DROP TABLE "payload_preferences";
      DROP TABLE "payload_preferences_rels";
      DROP TABLE "payload_migrations";
      DROP TABLE "resume_hero";
      DROP TABLE "_resume_hero_v";
      DROP TABLE "resume_about_me";
      DROP TABLE "_resume_about_me_v";
      DROP TABLE "resume_experience_entries";
      DROP TABLE "resume_experience";
      DROP TABLE "_resume_experience_v_version_entries";
      DROP TABLE "_resume_experience_v";
      DROP TABLE "resume_projects_entries";
      DROP TABLE "resume_projects";
      DROP TABLE "_resume_projects_v_version_entries";
      DROP TABLE "_resume_projects_v";
      DROP TABLE "resume_customers_entries";
      DROP TABLE "resume_customers";
      DROP TABLE "_resume_customers_v_version_entries";
      DROP TABLE "_resume_customers_v";
      DROP TABLE "resume_contact";
      DROP TABLE "_resume_contact_v";
      DROP TABLE "settings_navigation_header_nav_items";
      DROP TABLE "settings_navigation_footer_nav_items";
      DROP TABLE "settings_navigation";
      DROP TABLE "settings_navigation_rels";
      DROP TABLE "_settings_navigation_v_version_header_nav_items";
      DROP TABLE "_settings_navigation_v_version_footer_nav_items";
      DROP TABLE "_settings_navigation_v";
      DROP TABLE "_settings_navigation_v_rels";
      DROP TABLE "settings_meta";
      DROP TABLE "_settings_meta_v";`)
}
