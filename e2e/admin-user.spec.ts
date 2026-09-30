import { expect, type Page, test } from '@playwright/test'

/**
 *    The extra user fields (name, avatar, own-tracking toggle) must stay off
 *    /admin/create-first-user and /admin/login. The create-first-user view
 *    renders every field, so they are hidden through `admin.condition`
 *    (`src/collections/Users/index.ts`), which only a browser run verifies.
 *
 *    The create-first-user test needs an empty users collection (CI starts
 *    from an empty database) and skips otherwise; the login test then uses
 *    E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
 */
const email = process.env.E2E_ADMIN_EMAIL ?? 'e2e-admin@example.com'
const password = process.env.E2E_ADMIN_PASSWORD ?? 'e2e-admin-password-123'

/**
 *    Payload renders each field with the id `field-<path>`. Comparing the full
 *    set (not just the known extras) also catches any custom field added to
 *    the Users collection later without a condition.
 */
const expectOnlyFields = async (page: Page, expected: string[]) => {
  const form = page.locator('form')
  await expect(form.locator('#field-email')).toBeVisible()

  const ids = await form
    .locator('[id^="field-"]')
    .evaluateAll((elements) => elements.map((element) => element.id))

  expect(ids.sort()).toEqual(expected.map((path) => `field-${path}`).sort())
}

// Serial: the login test signs in with the user the first test creates.
test.describe
  .serial('admin user', () => {
    test('/admin/create-first-user hides the extra user fields', async ({ page }) => {
      await page.goto('/admin/create-first-user')
      await page.waitForURL(/\/admin\/(create-first-user|login)/)
      test.skip(page.url().includes('/admin/login'), 'a user already exists')

      await expectOnlyFields(page, [
        'email',
        'password',
        'confirm-password',
      ])

      await page.locator('#field-email').fill(email)
      await page.locator('#field-password').fill(password)
      await page.locator('#field-confirm-password').fill(password)
      await page.locator('form button[type="submit"]').click()

      // loginAfterCreate signs the new user in and Payload leaves the view.
      await expect(page).not.toHaveURL(/create-first-user/)
    })

    test('/admin/login hides the extra user fields', async ({ page }) => {
      await page.goto('/admin/login')

      await expectOnlyFields(page, [
        'email',
        'password',
      ])

      await page.locator('#field-email').fill(email)
      await page.locator('#field-password').fill(password)
      await page.locator('form button[type="submit"]').click()
      await expect(page).not.toHaveURL(/\/admin\/login/)

      // Signed in, the condition lets the fields render: they are hidden on
      // purpose, not missing from the collection.
      await page.goto('/admin/account')
      await expect(page.locator('#field-name')).toBeVisible()
      await expect(page.locator('#field-enableOwnTracking')).toBeVisible()
    })
  })
