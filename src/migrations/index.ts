import * as migration_00000001_initialize_basic_site from './00000001_initialize_basic_site'
import * as migration_00000002_remove_resume_skill_published_field from './00000002_remove_resume_skill_published_field'
import * as migration_00000003_backfill_draft_status from './00000003_backfill_draft_status'
import * as migration_00000004_backfill_draft_versions from './00000004_backfill_draft_versions'

export const migrations = [
  {
    up: migration_00000001_initialize_basic_site.up,
    down: migration_00000001_initialize_basic_site.down,
    name: '00000001_initialize_basic_site',
  },
  {
    up: migration_00000002_remove_resume_skill_published_field.up,
    down: migration_00000002_remove_resume_skill_published_field.down,
    name: '00000002_remove_resume_skill_published_field',
  },
  {
    up: migration_00000003_backfill_draft_status.up,
    down: migration_00000003_backfill_draft_status.down,
    name: '00000003_backfill_draft_status',
  },
  {
    up: migration_00000004_backfill_draft_versions.up,
    down: migration_00000004_backfill_draft_versions.down,
    name: '00000004_backfill_draft_versions',
  },
]
