import * as migration_00000001_initialize_site_settings from './00000001_initialize_site_settings'

export const migrations = [
  {
    up: migration_00000001_initialize_site_settings.up,
    down: migration_00000001_initialize_site_settings.down,
    name: '00000001_initialize_site_settings',
  },
]
