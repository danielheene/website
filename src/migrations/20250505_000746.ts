import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_blog_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_categories_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_blog_tags_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_tags_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_tags_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_media_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__media_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__media_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_users_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__users_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__users_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_hero_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_hero_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_hero_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_about_me_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_about_me_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_about_me_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_experience_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_experience_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_experience_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_projects_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_customers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_customers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_customers_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_resume_contact_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_contact_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__resume_contact_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_settings_navigation_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_settings_navigation_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_settings_navigation_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__settings_navigation_v_version_header_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__settings_navigation_v_version_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__settings_navigation_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__settings_navigation_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_settings_meta_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__settings_meta_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__settings_meta_v_published_locale" AS ENUM('en');
  CREATE TABLE IF NOT EXISTS "resume_dummy_collection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "blog_dummy_collection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "blog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_categories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_categories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__blog_categories_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "blog_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_tags_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_tags_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__blog_tags_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "blog_posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "blog_posts_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "blog_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_posts_id" integer,
  	"blog_categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__blog_posts_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_posts_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_blog_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"blog_posts_id" integer,
  	"blog_categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "general_dummy_collection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"blur_data_u_r_l" varchar,
  	"type" varchar,
  	"extension" varchar,
  	"prefix" varchar DEFAULT 'development',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_media_status" DEFAULT 'draft',
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
  
  CREATE TABLE IF NOT EXISTS "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar,
  	"version_blur_data_u_r_l" varchar,
  	"version_type" varchar,
  	"version_extension" varchar,
  	"version_prefix" varchar DEFAULT 'development',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__media_v_version_status" DEFAULT 'draft',
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__media_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_id" integer,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "pages_locales" (
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_id" integer,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_pages_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_users_status" DEFAULT 'draft',
  	"email" varchar,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_users_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__users_v_version_status" DEFAULT 'draft',
  	"version_email" varchar,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__users_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "settings_dummy_collection" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"resume_dummy_collection_id" integer,
  	"blog_dummy_collection_id" integer,
  	"blog_categories_id" integer,
  	"blog_tags_id" integer,
  	"blog_posts_id" integer,
  	"general_dummy_collection_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"users_id" integer,
  	"settings_dummy_collection_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "resume_dummy_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "resume_hero" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"background_id" integer,
  	"portrait_id" integer,
  	"title" varchar,
  	"caption" jsonb,
  	"_status" "enum_resume_hero_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_hero_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_background_id" integer,
  	"version_portrait_id" integer,
  	"version_title" varchar,
  	"version_caption" jsonb,
  	"version__status" "enum__resume_hero_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_hero_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resume_about_me" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portrait_id" integer,
  	"title" varchar,
  	"content" jsonb,
  	"anchor" varchar,
  	"_status" "enum_resume_about_me_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_about_me_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_portrait_id" integer,
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_anchor" varchar,
  	"version__status" "enum__resume_about_me_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_about_me_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resume_experience_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"employer" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"rich_text" jsonb,
  	"technologies" jsonb DEFAULT '[]'::jsonb
  );
  
  CREATE TABLE IF NOT EXISTS "resume_experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"anchor" varchar,
  	"skill_summary" jsonb,
  	"_status" "enum_resume_experience_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_experience_v_version_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"employer" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"rich_text" jsonb,
  	"technologies" jsonb DEFAULT '[]'::jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_experience_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_caption" jsonb,
  	"version_anchor" varchar,
  	"version_skill_summary" jsonb,
  	"version__status" "enum__resume_experience_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_experience_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resume_projects_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"subline" varchar,
  	"rich_text" jsonb,
  	"image_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "resume_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"anchor" varchar,
  	"_status" "enum_resume_projects_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_projects_v_version_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"subline" varchar,
  	"rich_text" jsonb,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_caption" jsonb,
  	"version_anchor" varchar,
  	"version__status" "enum__resume_projects_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resume_customers_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"logo" varchar,
  	"title" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "resume_customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"anchor" varchar,
  	"_status" "enum_resume_customers_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_customers_v_version_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_customers_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_caption" jsonb,
  	"version_anchor" varchar,
  	"version__status" "enum__resume_customers_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_customers_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "resume_contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"caption" jsonb,
  	"mail_button_label" varchar,
  	"mail_button_href" varchar,
  	"anchor" varchar,
  	"_status" "enum_resume_contact_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_resume_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_caption" jsonb,
  	"version_mail_button_label" varchar,
  	"version_mail_button_href" varchar,
  	"version_anchor" varchar,
  	"version__status" "enum__resume_contact_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__resume_contact_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "blog_dummy_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "general_dummy_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "settings_dummy_global" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "settings_navigation_header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_settings_navigation_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "settings_navigation_footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_settings_navigation_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "settings_navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_settings_navigation_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "settings_navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"blog_posts_id" integer,
  	"blog_categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_settings_navigation_v_version_header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__settings_navigation_v_version_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__settings_navigation_v_version_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_settings_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__settings_navigation_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__settings_navigation_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_settings_navigation_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"blog_posts_id" integer,
  	"blog_categories_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "settings_meta" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar,
  	"title_template" varchar,
  	"fallback_title" varchar,
  	"fallback_description" varchar,
  	"fallback_image_id" integer,
  	"keywords" jsonb DEFAULT '[]'::jsonb,
  	"_status" "enum_settings_meta_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "_settings_meta_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar,
  	"version_title_template" varchar,
  	"version_fallback_title" varchar,
  	"version_fallback_description" varchar,
  	"version_fallback_image_id" integer,
  	"version_keywords" jsonb DEFAULT '[]'::jsonb,
  	"version__status" "enum__settings_meta_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__settings_meta_v_published_locale",
  	"latest" boolean
  );
  
  DO $$ BEGIN
   ALTER TABLE "_blog_categories_v" ADD CONSTRAINT "_blog_categories_v_parent_id_blog_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_categories"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_tags_v" ADD CONSTRAINT "_blog_tags_v_parent_id_blog_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_tags"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_populated_authors" ADD CONSTRAINT "blog_posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_locales" ADD CONSTRAINT "blog_posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_locales" ADD CONSTRAINT "blog_posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_version_populated_authors" ADD CONSTRAINT "_blog_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_locales" ADD CONSTRAINT "_blog_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_locales" ADD CONSTRAINT "_blog_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_id_media_id_fk" FOREIGN KEY ("hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_id_media_id_fk" FOREIGN KEY ("version_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resume_dummy_collection_fk" FOREIGN KEY ("resume_dummy_collection_id") REFERENCES "public"."resume_dummy_collection"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_dummy_collection_fk" FOREIGN KEY ("blog_dummy_collection_id") REFERENCES "public"."blog_dummy_collection"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_tags_fk" FOREIGN KEY ("blog_tags_id") REFERENCES "public"."blog_tags"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_general_dummy_collection_fk" FOREIGN KEY ("general_dummy_collection_id") REFERENCES "public"."general_dummy_collection"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_settings_dummy_collection_fk" FOREIGN KEY ("settings_dummy_collection_id") REFERENCES "public"."settings_dummy_collection"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_hero" ADD CONSTRAINT "resume_hero_background_id_media_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_hero" ADD CONSTRAINT "resume_hero_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_hero_v" ADD CONSTRAINT "_resume_hero_v_version_background_id_media_id_fk" FOREIGN KEY ("version_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_hero_v" ADD CONSTRAINT "_resume_hero_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_about_me" ADD CONSTRAINT "resume_about_me_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_about_me_v" ADD CONSTRAINT "_resume_about_me_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_experience_entries" ADD CONSTRAINT "resume_experience_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_experience"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_experience_v_version_entries" ADD CONSTRAINT "_resume_experience_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_projects_entries" ADD CONSTRAINT "resume_projects_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_projects_entries" ADD CONSTRAINT "resume_projects_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_projects_v_version_entries" ADD CONSTRAINT "_resume_projects_v_version_entries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_projects_v_version_entries" ADD CONSTRAINT "_resume_projects_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "resume_customers_entries" ADD CONSTRAINT "resume_customers_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."resume_customers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_resume_customers_v_version_entries" ADD CONSTRAINT "_resume_customers_v_version_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_resume_customers_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_header_nav_items" ADD CONSTRAINT "settings_navigation_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_footer_nav_items" ADD CONSTRAINT "settings_navigation_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_rels" ADD CONSTRAINT "settings_navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."settings_navigation"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_rels" ADD CONSTRAINT "settings_navigation_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_rels" ADD CONSTRAINT "settings_navigation_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_navigation_rels" ADD CONSTRAINT "settings_navigation_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_version_header_nav_items" ADD CONSTRAINT "_settings_navigation_v_version_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_version_footer_nav_items" ADD CONSTRAINT "_settings_navigation_v_version_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_settings_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_rels" ADD CONSTRAINT "_settings_navigation_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_settings_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_rels" ADD CONSTRAINT "_settings_navigation_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_rels" ADD CONSTRAINT "_settings_navigation_v_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_navigation_v_rels" ADD CONSTRAINT "_settings_navigation_v_rels_blog_categories_fk" FOREIGN KEY ("blog_categories_id") REFERENCES "public"."blog_categories"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "settings_meta" ADD CONSTRAINT "settings_meta_fallback_image_id_media_id_fk" FOREIGN KEY ("fallback_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_settings_meta_v" ADD CONSTRAINT "_settings_meta_v_version_fallback_image_id_media_id_fk" FOREIGN KEY ("version_fallback_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "resume_dummy_collection_updated_at_idx" ON "resume_dummy_collection" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "resume_dummy_collection_created_at_idx" ON "resume_dummy_collection" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "blog_dummy_collection_updated_at_idx" ON "blog_dummy_collection" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "blog_dummy_collection_created_at_idx" ON "blog_dummy_collection" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_idx" ON "blog_categories" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "blog_categories_updated_at_idx" ON "blog_categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "blog_categories_created_at_idx" ON "blog_categories" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "blog_categories__status_idx" ON "blog_categories" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_parent_idx" ON "_blog_categories_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_version_version_slug_idx" ON "_blog_categories_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_version_version_updated_at_idx" ON "_blog_categories_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_version_version_created_at_idx" ON "_blog_categories_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_version_version__status_idx" ON "_blog_categories_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_created_at_idx" ON "_blog_categories_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_updated_at_idx" ON "_blog_categories_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_snapshot_idx" ON "_blog_categories_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_published_locale_idx" ON "_blog_categories_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_blog_categories_v_latest_idx" ON "_blog_categories_v" USING btree ("latest");
  CREATE UNIQUE INDEX IF NOT EXISTS "blog_tags_slug_idx" ON "blog_tags" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "blog_tags_updated_at_idx" ON "blog_tags" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "blog_tags_created_at_idx" ON "blog_tags" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "blog_tags__status_idx" ON "blog_tags" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_parent_idx" ON "_blog_tags_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_version_version_slug_idx" ON "_blog_tags_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_version_version_updated_at_idx" ON "_blog_tags_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_version_version_created_at_idx" ON "_blog_tags_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_version_version__status_idx" ON "_blog_tags_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_created_at_idx" ON "_blog_tags_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_updated_at_idx" ON "_blog_tags_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_snapshot_idx" ON "_blog_tags_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_published_locale_idx" ON "_blog_tags_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_blog_tags_v_latest_idx" ON "_blog_tags_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "blog_posts_populated_authors_order_idx" ON "blog_posts_populated_authors" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "blog_posts_populated_authors_parent_id_idx" ON "blog_posts_populated_authors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "blog_posts_meta_meta_image_idx" ON "blog_posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_locales_locale_parent_id_unique" ON "blog_posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_order_idx" ON "blog_posts_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_parent_idx" ON "blog_posts_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_path_idx" ON "blog_posts_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_blog_posts_id_idx" ON "blog_posts_rels" USING btree ("blog_posts_id");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_blog_categories_id_idx" ON "blog_posts_rels" USING btree ("blog_categories_id");
  CREATE INDEX IF NOT EXISTS "blog_posts_rels_users_id_idx" ON "blog_posts_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_populated_authors_order_idx" ON "_blog_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_populated_authors_parent_id_idx" ON "_blog_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_snapshot_idx" ON "_blog_posts_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_published_locale_idx" ON "_blog_posts_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_autosave_idx" ON "_blog_posts_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_version_meta_version_meta_image_idx" ON "_blog_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "_blog_posts_v_locales_locale_parent_id_unique" ON "_blog_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_order_idx" ON "_blog_posts_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_parent_idx" ON "_blog_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_path_idx" ON "_blog_posts_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_blog_posts_id_idx" ON "_blog_posts_v_rels" USING btree ("blog_posts_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_blog_categories_id_idx" ON "_blog_posts_v_rels" USING btree ("blog_categories_id");
  CREATE INDEX IF NOT EXISTS "_blog_posts_v_rels_users_id_idx" ON "_blog_posts_v_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "general_dummy_collection_updated_at_idx" ON "general_dummy_collection" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "general_dummy_collection_created_at_idx" ON "general_dummy_collection" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "media__status_idx" ON "media" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_media_v_version_version__status_idx" ON "_media_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX IF NOT EXISTS "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_media_v_snapshot_idx" ON "_media_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_media_v_published_locale_idx" ON "_media_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_media_v_latest_idx" ON "_media_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "pages_hero_idx" ON "pages" USING btree ("hero_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_hero_idx" ON "_pages_v" USING btree ("version_hero_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "users__status_idx" ON "users" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "_users_v_parent_idx" ON "_users_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_users_v_version_version_updated_at_idx" ON "_users_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_users_v_version_version_created_at_idx" ON "_users_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_users_v_version_version__status_idx" ON "_users_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_users_v_version_version_email_idx" ON "_users_v" USING btree ("version_email");
  CREATE INDEX IF NOT EXISTS "_users_v_created_at_idx" ON "_users_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_users_v_updated_at_idx" ON "_users_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_users_v_snapshot_idx" ON "_users_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_users_v_published_locale_idx" ON "_users_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_users_v_latest_idx" ON "_users_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "settings_dummy_collection_updated_at_idx" ON "settings_dummy_collection" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "settings_dummy_collection_created_at_idx" ON "settings_dummy_collection" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_resume_dummy_collection_id_idx" ON "payload_locked_documents_rels" USING btree ("resume_dummy_collection_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_blog_dummy_collection_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_dummy_collection_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_blog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_categories_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_blog_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_tags_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_general_dummy_collection_id_idx" ON "payload_locked_documents_rels" USING btree ("general_dummy_collection_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_settings_dummy_collection_id_idx" ON "payload_locked_documents_rels" USING btree ("settings_dummy_collection_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "resume_hero_background_idx" ON "resume_hero" USING btree ("background_id");
  CREATE INDEX IF NOT EXISTS "resume_hero_portrait_idx" ON "resume_hero" USING btree ("portrait_id");
  CREATE INDEX IF NOT EXISTS "resume_hero__status_idx" ON "resume_hero" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_version_version_background_idx" ON "_resume_hero_v" USING btree ("version_background_id");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_version_version_portrait_idx" ON "_resume_hero_v" USING btree ("version_portrait_id");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_version_version__status_idx" ON "_resume_hero_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_created_at_idx" ON "_resume_hero_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_updated_at_idx" ON "_resume_hero_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_snapshot_idx" ON "_resume_hero_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_published_locale_idx" ON "_resume_hero_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_hero_v_latest_idx" ON "_resume_hero_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resume_about_me_portrait_idx" ON "resume_about_me" USING btree ("portrait_id");
  CREATE INDEX IF NOT EXISTS "resume_about_me__status_idx" ON "resume_about_me" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_version_version_portrait_idx" ON "_resume_about_me_v" USING btree ("version_portrait_id");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_version_version__status_idx" ON "_resume_about_me_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_created_at_idx" ON "_resume_about_me_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_updated_at_idx" ON "_resume_about_me_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_snapshot_idx" ON "_resume_about_me_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_published_locale_idx" ON "_resume_about_me_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_about_me_v_latest_idx" ON "_resume_about_me_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resume_experience_entries_order_idx" ON "resume_experience_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resume_experience_entries_parent_id_idx" ON "resume_experience_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resume_experience__status_idx" ON "resume_experience" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_entries_order_idx" ON "_resume_experience_v_version_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_entries_parent_id_idx" ON "_resume_experience_v_version_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_version_version__status_idx" ON "_resume_experience_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_created_at_idx" ON "_resume_experience_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_updated_at_idx" ON "_resume_experience_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_snapshot_idx" ON "_resume_experience_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_published_locale_idx" ON "_resume_experience_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_experience_v_latest_idx" ON "_resume_experience_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resume_projects_entries_order_idx" ON "resume_projects_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resume_projects_entries_parent_id_idx" ON "resume_projects_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resume_projects_entries_image_idx" ON "resume_projects_entries" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "resume_projects__status_idx" ON "resume_projects" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_entries_order_idx" ON "_resume_projects_v_version_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_entries_parent_id_idx" ON "_resume_projects_v_version_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_entries_image_idx" ON "_resume_projects_v_version_entries" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_version_version__status_idx" ON "_resume_projects_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_created_at_idx" ON "_resume_projects_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_updated_at_idx" ON "_resume_projects_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_snapshot_idx" ON "_resume_projects_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_published_locale_idx" ON "_resume_projects_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_projects_v_latest_idx" ON "_resume_projects_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resume_customers_entries_order_idx" ON "resume_customers_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "resume_customers_entries_parent_id_idx" ON "resume_customers_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "resume_customers__status_idx" ON "resume_customers" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_entries_order_idx" ON "_resume_customers_v_version_entries" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_entries_parent_id_idx" ON "_resume_customers_v_version_entries" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_version_version__status_idx" ON "_resume_customers_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_created_at_idx" ON "_resume_customers_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_updated_at_idx" ON "_resume_customers_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_snapshot_idx" ON "_resume_customers_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_published_locale_idx" ON "_resume_customers_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_customers_v_latest_idx" ON "_resume_customers_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "resume_contact__status_idx" ON "resume_contact" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_version_version__status_idx" ON "_resume_contact_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_created_at_idx" ON "_resume_contact_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_updated_at_idx" ON "_resume_contact_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_snapshot_idx" ON "_resume_contact_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_published_locale_idx" ON "_resume_contact_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_resume_contact_v_latest_idx" ON "_resume_contact_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "settings_navigation_header_nav_items_order_idx" ON "settings_navigation_header_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "settings_navigation_header_nav_items_parent_id_idx" ON "settings_navigation_header_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "settings_navigation_footer_nav_items_order_idx" ON "settings_navigation_footer_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "settings_navigation_footer_nav_items_parent_id_idx" ON "settings_navigation_footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "settings_navigation__status_idx" ON "settings_navigation" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_order_idx" ON "settings_navigation_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_parent_idx" ON "settings_navigation_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_path_idx" ON "settings_navigation_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_pages_id_idx" ON "settings_navigation_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_blog_posts_id_idx" ON "settings_navigation_rels" USING btree ("blog_posts_id");
  CREATE INDEX IF NOT EXISTS "settings_navigation_rels_blog_categories_id_idx" ON "settings_navigation_rels" USING btree ("blog_categories_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_header_nav_items_order_idx" ON "_settings_navigation_v_version_header_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_header_nav_items_parent_id_idx" ON "_settings_navigation_v_version_header_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items_order_idx" ON "_settings_navigation_v_version_footer_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_footer_nav_items_parent_id_idx" ON "_settings_navigation_v_version_footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_version_version__status_idx" ON "_settings_navigation_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_created_at_idx" ON "_settings_navigation_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_updated_at_idx" ON "_settings_navigation_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_snapshot_idx" ON "_settings_navigation_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_published_locale_idx" ON "_settings_navigation_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_latest_idx" ON "_settings_navigation_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_order_idx" ON "_settings_navigation_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_parent_idx" ON "_settings_navigation_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_path_idx" ON "_settings_navigation_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_pages_id_idx" ON "_settings_navigation_v_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_blog_posts_id_idx" ON "_settings_navigation_v_rels" USING btree ("blog_posts_id");
  CREATE INDEX IF NOT EXISTS "_settings_navigation_v_rels_blog_categories_id_idx" ON "_settings_navigation_v_rels" USING btree ("blog_categories_id");
  CREATE INDEX IF NOT EXISTS "settings_meta_fallback_image_idx" ON "settings_meta" USING btree ("fallback_image_id");
  CREATE INDEX IF NOT EXISTS "settings_meta__status_idx" ON "settings_meta" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_version_version_fallback_image_idx" ON "_settings_meta_v" USING btree ("version_fallback_image_id");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_version_version__status_idx" ON "_settings_meta_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_created_at_idx" ON "_settings_meta_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_updated_at_idx" ON "_settings_meta_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_snapshot_idx" ON "_settings_meta_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_published_locale_idx" ON "_settings_meta_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_settings_meta_v_latest_idx" ON "_settings_meta_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "resume_dummy_collection" CASCADE;
  DROP TABLE "blog_dummy_collection" CASCADE;
  DROP TABLE "blog_categories" CASCADE;
  DROP TABLE "_blog_categories_v" CASCADE;
  DROP TABLE "blog_tags" CASCADE;
  DROP TABLE "_blog_tags_v" CASCADE;
  DROP TABLE "blog_posts_populated_authors" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "blog_posts_locales" CASCADE;
  DROP TABLE "blog_posts_rels" CASCADE;
  DROP TABLE "_blog_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "_blog_posts_v_locales" CASCADE;
  DROP TABLE "_blog_posts_v_rels" CASCADE;
  DROP TABLE "general_dummy_collection" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "_users_v" CASCADE;
  DROP TABLE "settings_dummy_collection" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "resume_dummy_global" CASCADE;
  DROP TABLE "resume_hero" CASCADE;
  DROP TABLE "_resume_hero_v" CASCADE;
  DROP TABLE "resume_about_me" CASCADE;
  DROP TABLE "_resume_about_me_v" CASCADE;
  DROP TABLE "resume_experience_entries" CASCADE;
  DROP TABLE "resume_experience" CASCADE;
  DROP TABLE "_resume_experience_v_version_entries" CASCADE;
  DROP TABLE "_resume_experience_v" CASCADE;
  DROP TABLE "resume_projects_entries" CASCADE;
  DROP TABLE "resume_projects" CASCADE;
  DROP TABLE "_resume_projects_v_version_entries" CASCADE;
  DROP TABLE "_resume_projects_v" CASCADE;
  DROP TABLE "resume_customers_entries" CASCADE;
  DROP TABLE "resume_customers" CASCADE;
  DROP TABLE "_resume_customers_v_version_entries" CASCADE;
  DROP TABLE "_resume_customers_v" CASCADE;
  DROP TABLE "resume_contact" CASCADE;
  DROP TABLE "_resume_contact_v" CASCADE;
  DROP TABLE "blog_dummy_global" CASCADE;
  DROP TABLE "general_dummy_global" CASCADE;
  DROP TABLE "settings_dummy_global" CASCADE;
  DROP TABLE "settings_navigation_header_nav_items" CASCADE;
  DROP TABLE "settings_navigation_footer_nav_items" CASCADE;
  DROP TABLE "settings_navigation" CASCADE;
  DROP TABLE "settings_navigation_rels" CASCADE;
  DROP TABLE "_settings_navigation_v_version_header_nav_items" CASCADE;
  DROP TABLE "_settings_navigation_v_version_footer_nav_items" CASCADE;
  DROP TABLE "_settings_navigation_v" CASCADE;
  DROP TABLE "_settings_navigation_v_rels" CASCADE;
  DROP TABLE "settings_meta" CASCADE;
  DROP TABLE "_settings_meta_v" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_blog_categories_status";
  DROP TYPE "public"."enum__blog_categories_v_version_status";
  DROP TYPE "public"."enum__blog_categories_v_published_locale";
  DROP TYPE "public"."enum_blog_tags_status";
  DROP TYPE "public"."enum__blog_tags_v_version_status";
  DROP TYPE "public"."enum__blog_tags_v_published_locale";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum__blog_posts_v_published_locale";
  DROP TYPE "public"."enum_media_status";
  DROP TYPE "public"."enum__media_v_version_status";
  DROP TYPE "public"."enum__media_v_published_locale";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum__users_v_version_status";
  DROP TYPE "public"."enum__users_v_published_locale";
  DROP TYPE "public"."enum_resume_hero_status";
  DROP TYPE "public"."enum__resume_hero_v_version_status";
  DROP TYPE "public"."enum__resume_hero_v_published_locale";
  DROP TYPE "public"."enum_resume_about_me_status";
  DROP TYPE "public"."enum__resume_about_me_v_version_status";
  DROP TYPE "public"."enum__resume_about_me_v_published_locale";
  DROP TYPE "public"."enum_resume_experience_status";
  DROP TYPE "public"."enum__resume_experience_v_version_status";
  DROP TYPE "public"."enum__resume_experience_v_published_locale";
  DROP TYPE "public"."enum_resume_projects_status";
  DROP TYPE "public"."enum__resume_projects_v_version_status";
  DROP TYPE "public"."enum__resume_projects_v_published_locale";
  DROP TYPE "public"."enum_resume_customers_status";
  DROP TYPE "public"."enum__resume_customers_v_version_status";
  DROP TYPE "public"."enum__resume_customers_v_published_locale";
  DROP TYPE "public"."enum_resume_contact_status";
  DROP TYPE "public"."enum__resume_contact_v_version_status";
  DROP TYPE "public"."enum__resume_contact_v_published_locale";
  DROP TYPE "public"."enum_settings_navigation_header_nav_items_link_type";
  DROP TYPE "public"."enum_settings_navigation_footer_nav_items_link_type";
  DROP TYPE "public"."enum_settings_navigation_status";
  DROP TYPE "public"."enum__settings_navigation_v_version_header_nav_items_link_type";
  DROP TYPE "public"."enum__settings_navigation_v_version_footer_nav_items_link_type";
  DROP TYPE "public"."enum__settings_navigation_v_version_status";
  DROP TYPE "public"."enum__settings_navigation_v_published_locale";
  DROP TYPE "public"."enum_settings_meta_status";
  DROP TYPE "public"."enum__settings_meta_v_version_status";
  DROP TYPE "public"."enum__settings_meta_v_published_locale";`)
}
