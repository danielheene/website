import * as migration_00000001_initialize_basic_site from './00000001_initialize_basic_site'
import * as migration_00000002_remove_resume_skill_published_field from './00000002_remove_resume_skill_published_field'

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
]
