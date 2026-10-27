import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

/** Real package directory, bypassing the tsconfig `react` -> @types alias. */
const packageDir = (name: string) => path.dirname(require.resolve(`${name}/package.json`))

const appRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(appRoot, '../..')

export default defineConfig({
  resolve: {
    alias: {
      // The repo-root tsconfig maps `@/*` to both apps, so Vite cannot pick
      // the right one on its own — each app resolves its own `src/` here.
      '@': path.join(appRoot, 'src'),
      '@payload-config': path.join(appRoot, 'payload.config.ts'),
      '@website/types': path.join(repoRoot, 'packages/types/src'),
      '@website/styles': path.join(repoRoot, 'packages/styles'),
      '@website/components': path.join(repoRoot, 'packages/components/src'),
      '@website/lib': path.join(repoRoot, 'packages/lib/src'),
      '@website/app-components': path.join(repoRoot, 'packages/app-components/src'),
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
    include: ['src/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'e2e/**'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**', 'src/access/**', 'src/fields/**/hooks/**'],
      exclude: ['**/*.test.ts', '**/index.ts', 'src/types/**'],
    },
  },
})
