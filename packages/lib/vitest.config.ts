import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

/** Real package directory, bypassing the tsconfig `react` -> @types alias. */
const packageDir = (name: string) => path.dirname(require.resolve(`${name}/package.json`))

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(packageRoot, '../..')

export default defineConfig({
  resolve: {
    alias: {
      '@website/types': path.join(repoRoot, 'packages/types/src'),
      '@website/styles': path.join(repoRoot, 'packages/styles'),
      '@website/components': path.join(repoRoot, 'packages/components/src'),
      '@website/lib': path.join(repoRoot, 'packages/lib/src'),
      // tsconfig maps `react` to @types/react for editor tooling; that path
      // has no runtime entry, so component tests must resolve the real package
      react: packageDir('react'),
      'react-dom': packageDir('react-dom'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['../../vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    clearMocks: true,
    restoreMocks: true,
  },
})
