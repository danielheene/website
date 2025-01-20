import * as migration_20250120_100114 from './20250120_100114'

export const migrations = [
  {
    up: migration_20250120_100114.up,
    down: migration_20250120_100114.down,
    name: '20250120_100114',
  },
]
