import * as migration_20250505_000746 from './20250505_000746';

export const migrations = [
  {
    up: migration_20250505_000746.up,
    down: migration_20250505_000746.down,
    name: '20250505_000746'
  },
];
