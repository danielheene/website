import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PORT ?? 3000)
const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 3100)
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`
const backendURL = process.env.E2E_BACKEND_URL ?? `http://localhost:${BACKEND_PORT}`

/**
 *    E2E configuration.
 *
 *    Env: run via `bun run test:e2e` which loads .env.test through Node's native
 *    --env-file flag. Prerequisite: `docker compose up -d` (Mongo/Redis/S3).
 *
 *    The repo is a monorepo with three apps, and the E2E specs touch two of
 *    them: the public pages come from the frontend, the `/admin/*` pages from
 *    the Payload backend.
 *
 *    Two ways the apps get started:
 *
 *    - `E2E_USE_IMAGES=1` runs the real container images (each app's own
 *      Dockerfile) instead of dev servers. This is what CI does: it proves the
 *      images that ship actually work, not just the source tree.
 *    - otherwise both apps are started as dev servers, the frontend pointed at
 *      the backend (which is what `PAYLOAD_API_URL` is for).
 *
 *    `E2E_NO_SERVER=1` skips the managed servers entirely — used by the Docker
 *    flow (scripts/e2e-docker.sh), where the apps already run on the host.
 */
const useImages = process.env.E2E_USE_IMAGES === '1'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['github'],
        [
          'html',
          {
            open: 'never',
          },
        ],
      ]
    : [['list']],
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
    : useImages
      ? [
          {
            // The real backend image, running the admin panel and the REST API
            // the frontend reads from.
            command: `docker run --rm --network host -e PORT=${BACKEND_PORT} website-backend-app:e2e`,
            url: `${backendURL}/admin`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            stdout: 'pipe',
            stderr: 'pipe',
          },
          {
            // The real frontend image, pointed at the backend above.
            command: `docker run --rm --network host -e PORT=${PORT} -e PAYLOAD_API_URL=${backendURL} website-frontend:e2e`,
            url: baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            stdout: 'pipe',
            stderr: 'pipe',
          },
        ]
      : [
          {
            // The Payload backend serves the admin panel and the REST API the
            // frontend reads from.
            command: 'bun run dev:backend',
            cwd: './apps/backend',
            url: `${backendURL}/admin`,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            stdout: 'pipe',
            stderr: 'pipe',
          },
          {
            // The public frontend, pointed at the backend above.
            command: 'bun run dev:frontend',
            cwd: './apps/frontend',
            url: baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            stdout: 'pipe',
            stderr: 'pipe',
            env: {
              PAYLOAD_API_URL: backendURL,
              PORT: String(PORT),
            },
          },
        ],
})
