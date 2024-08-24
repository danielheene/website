import * as migration_20240825_021512_initial from './20240825_021512_initial';
import * as migration_20240911_200408 from './20240911_200408';

export const migrations = [
  {
    up: migration_20240825_021512_initial.up,
    down: migration_20240825_021512_initial.down,
    name: '20240825_021512_initial',
  },
  {
    up: migration_20240911_200408.up,
    down: migration_20240911_200408.down,
    name: '20240911_200408'
  },
];
