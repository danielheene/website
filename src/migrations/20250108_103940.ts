import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "resume_experience" ADD COLUMN "skill_summary" jsonb;
  ALTER TABLE "_resume_experience_v" ADD COLUMN "version_skill_summary" jsonb;`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "resume_experience" DROP COLUMN IF EXISTS "skill_summary";
  ALTER TABLE "_resume_experience_v" DROP COLUMN IF EXISTS "version_skill_summary";`)
}
