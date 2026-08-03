import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: [
      './vitest.setup.ts',
    ],
    include: [
      'src/**/*.test.{ts,tsx}',
    ],
    clearMocks: true,
    restoreMocks: true,
  },
})
