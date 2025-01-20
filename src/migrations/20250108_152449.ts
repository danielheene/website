import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "resume_contact" RENAME COLUMN "button_label" TO "mail_button_label";
  ALTER TABLE "resume_contact" RENAME COLUMN "button_mail_to" TO "mail_button_href";
  ALTER TABLE "_resume_contact_v" RENAME COLUMN "version_button_label" TO "version_mail_button_label";
  ALTER TABLE "_resume_contact_v" RENAME COLUMN "version_button_mail_to" TO "version_mail_button_href";
  ALTER TABLE "resume_contact" ADD COLUMN "schedule_button_label" varchar;
  ALTER TABLE "resume_contact" ADD COLUMN "schedule_button_href" varchar;
  ALTER TABLE "_resume_contact_v" ADD COLUMN "version_schedule_button_label" varchar;
  ALTER TABLE "_resume_contact_v" ADD COLUMN "version_schedule_button_href" varchar;`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "resume_contact" ADD COLUMN "button_label" varchar;
  ALTER TABLE "resume_contact" ADD COLUMN "button_mail_to" varchar;
  ALTER TABLE "_resume_contact_v" ADD COLUMN "version_button_label" varchar;
  ALTER TABLE "_resume_contact_v" ADD COLUMN "version_button_mail_to" varchar;
  ALTER TABLE "resume_contact" DROP COLUMN IF EXISTS "mail_button_label";
  ALTER TABLE "resume_contact" DROP COLUMN IF EXISTS "mail_button_href";
  ALTER TABLE "resume_contact" DROP COLUMN IF EXISTS "schedule_button_label";
  ALTER TABLE "resume_contact" DROP COLUMN IF EXISTS "schedule_button_href";
  ALTER TABLE "_resume_contact_v" DROP COLUMN IF EXISTS "version_mail_button_label";
  ALTER TABLE "_resume_contact_v" DROP COLUMN IF EXISTS "version_mail_button_href";
  ALTER TABLE "_resume_contact_v" DROP COLUMN IF EXISTS "version_schedule_button_label";
  ALTER TABLE "_resume_contact_v" DROP COLUMN IF EXISTS "version_schedule_button_href";`)
}
