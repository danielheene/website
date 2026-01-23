import * as migration_20260119_075700_migration from './20260119_075700_migration'

export const migrations = [
  {
    up: migration_20260119_075700_migration.up,
    down: migration_20260119_075700_migration.down,
    name: '20260119_075700_migration',
  },
]
