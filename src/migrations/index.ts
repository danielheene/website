import * as migration_01_initialize_page_framework from './01_initialize_page_framework'

export const migrations = [
  {
    up: migration_01_initialize_page_framework.up,
    down: migration_01_initialize_page_framework.down,
    name: '01_initialize_page_framework',
  },
]
