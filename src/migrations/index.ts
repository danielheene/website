import * as migration_00000001_initialize_basic_site from './00000001_initialize_basic_site'
import * as migration_00000002_remove_resume_skill_published_field from './00000002_remove_resume_skill_published_field'
import * as migration_00000003_backfill_draft_status from './00000003_backfill_draft_status'
import * as migration_00000004_recompute_stale_excerpts from './00000004_recompute_stale_excerpts'
import * as migration_00000005_manual_rich_text_excerpts from './00000005_manual_rich_text_excerpts'
import * as migration_00000006_rich_text_page_blocks from './00000006_rich_text_page_blocks'
import * as migration_00000007_backfill_draft_versions from './00000007_backfill_draft_versions'
import * as migration_00000008_structured_phone_number from './00000008_structured_phone_number'
import * as migration_00000009_page_layouts from './00000009_page_layouts'

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
    up: migration_00000004_recompute_stale_excerpts.up,
    down: migration_00000004_recompute_stale_excerpts.down,
    name: '00000004_recompute_stale_excerpts',
  },
  {
    up: migration_00000005_manual_rich_text_excerpts.up,
    down: migration_00000005_manual_rich_text_excerpts.down,
    name: '00000005_manual_rich_text_excerpts',
  },
  {
    up: migration_00000006_rich_text_page_blocks.up,
    down: migration_00000006_rich_text_page_blocks.down,
    name: '00000006_rich_text_page_blocks',
  },
  {
    up: migration_00000007_backfill_draft_versions.up,
    down: migration_00000007_backfill_draft_versions.down,
    name: '00000007_backfill_draft_versions',
  },
  {
    up: migration_00000008_structured_phone_number.up,
    down: migration_00000008_structured_phone_number.down,
    name: '00000008_structured_phone_number',
  },
  {
    up: migration_00000009_page_layouts.up,
    down: migration_00000009_page_layouts.down,
    name: '00000009_page_layouts',
  },
]
