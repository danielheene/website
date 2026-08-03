import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Node by default; the component/hook tests that need a DOM opt in per file
    // with `// @vitest-environment jsdom`, matching the app's convention.
    environment: 'node',
    globals: false,
    include: [
      'src/**/*.test.{ts,tsx}',
    ],
    clearMocks: true,
    restoreMocks: true,
  },
})
