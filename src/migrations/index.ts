import * as migration_20250404_062325 from './20250404_062325';

export const migrations = [
  {
    up: migration_20250404_062325.up,
    down: migration_20250404_062325.down,
    name: '20250404_062325'
  },
];
