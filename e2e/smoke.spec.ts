import { expect, test } from '@playwright/test'

/**
 *    Smoke tests only — the site is CMS-driven and the database may be empty,
 *    so these assert structural health (status codes, shell rendering), not
 *    content. Content-level E2E requires a seed script (future work).
 */
test.describe('smoke', () => {
  test('homepage responds and renders a document', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveTitle(/.+/)
  })

  test('admin panel serves the Payload login screen', async ({ page }) => {
    // Target /admin/login directly: the unauthenticated redirect from /admin
    // uses the absolute SERVER_URL, so this only works when the browser
    // origin matches it (the Docker flow uses host networking for this).
    await page.goto('/admin/login')
    // An empty database redirects further to /admin/create-first-user.
    await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('unknown route returns a 404 page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-abc123')
    expect(response?.status()).toBe(404)
  })

  test('no uncaught page errors on the homepage', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})
