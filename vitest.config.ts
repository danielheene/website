import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
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
