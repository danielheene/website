import * as migration_00000001_initialize_basic_site from './00000001_initialize_basic_site'
import * as migration_00000002_backfill_draft_status from './00000002_backfill_draft_status'

export const migrations = [
  {
    up: migration_00000001_initialize_basic_site.up,
    down: migration_00000001_initialize_basic_site.down,
    name: '00000001_initialize_basic_site',
  },
  {
    up: migration_00000002_backfill_draft_status.up,
    down: migration_00000002_backfill_draft_status.down,
    name: '00000002_backfill_draft_status',
  },
]
