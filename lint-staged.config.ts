import { defineConfig } from 'lint-staged/config'

export default defineConfig({
  'package.json': [
    'syncpack format --source',
    'syncpack fix --dependency-types prod,dev,peer --source',
    () => 'pnpm install',
  ],
  '*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css}': [
    'biome check --write --no-errors-on-unmatched',
  ],
})
