import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

/**
 *    E2E configuration.
 *
 *    Env: run via `pnpm test:e2e` which loads .env.test through Node's native
 *    --env-file flag. Prerequisite: `docker compose up -d` (Mongo/Redis/S3).
 *
 *    E2E_NO_SERVER=1 skips the managed web server — used by the Docker flow
 *    (scripts/e2e-docker.sh), where the app already runs on the host.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        [
          'github',
        ],
        [
          'html',
          {
            open: 'never',
          },
        ],
      ]
    : [
        [
          'list',
        ],
      ],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'pnpm run dev:app',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
})
