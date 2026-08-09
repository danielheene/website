import { createRequire } from 'node:module'
import path from 'node:path'

import { defineConfig } from 'vitest/config'

const require = createRequire(import.meta.url)

/** Real package directory, bypassing the tsconfig `react` -> @types alias. */
const packageDir = (name: string) => path.dirname(require.resolve(`${name}/package.json`))

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // tsconfig maps `react` to @types/react for editor tooling; that path
      // has no runtime entry, so component tests must resolve the real package
      react: packageDir('react'),
      'react-dom': packageDir('react-dom'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    setupFiles: [
      './vitest.setup.ts',
    ],
    include: [
      'src/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'dist',
      'e2e/**',
    ],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: [
        'text',
        'html',
        'lcov',
      ],
      include: [
        'src/lib/**',
        'src/access/**',
        'src/fields/**/hooks/**',
      ],
      exclude: [
        '**/*.test.ts',
        '**/index.ts',
        'src/types/**',
      ],
    },
  },
})
