export default {
  'package.json': [
    'syncpack format --source',
    'syncpack fix --dependency-types prod,dev,peer --source',
    // lint-staged appends staged filenames to string commands — `pnpm
    // install package.json` fails with ERR_PNPM_NOT_PACKAGE_DIRECTORY.
    // The function form lets the command omit them.
    () => 'pnpm install',
  ],
  '*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css}': [
    'biome check --write --no-errors-on-unmatched',
  ],
}
