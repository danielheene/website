import * as migration_00000001_initialize_basic_site from './00000001_initialize_basic_site'

export const migrations = [
  {
    up: migration_00000001_initialize_basic_site.up,
    down: migration_00000001_initialize_basic_site.down,
    name: '00000001_initialize_basic_site',
  },
]
