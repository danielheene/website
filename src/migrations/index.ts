import * as migration_20250107_055446 from './20250107_055446'
import * as migration_20250108_103940 from './20250108_103940'
import * as migration_20250108_152449 from './20250108_152449'
import * as migration_20250109_190919 from './20250109_190919'
import * as migration_20250113_113100 from './20250113_113100'

export const migrations = [
  {
    up: migration_20250107_055446.up,
    down: migration_20250107_055446.down,
    name: '20250107_055446',
  },
  {
    up: migration_20250108_103940.up,
    down: migration_20250108_103940.down,
    name: '20250108_103940',
  },
  {
    up: migration_20250108_152449.up,
    down: migration_20250108_152449.down,
    name: '20250108_152449',
  },
  {
    up: migration_20250109_190919.up,
    down: migration_20250109_190919.down,
    name: '20250109_190919',
  },
  {
    up: migration_20250113_113100.up,
    down: migration_20250113_113100.down,
    name: '20250113_113100',
  },
]
