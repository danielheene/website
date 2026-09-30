import { expect, test } from '@playwright/test'

/**
 *    Resume document pages. Needs the fixture documents from
 *    `pnpm run seed:resume-documents` (CI runs it before the suite): an older
 *    and a newer one, so the older page shows the "newer version" banner.
 *
 *    Headings are queried by role: after a client navigation Next keeps the
 *    previous page in the DOM, hidden, and role queries skip hidden elements.
 */
const olderSlug = 'seeded-dummy-resume-older'

test.describe('resume documents', () => {
  test('/resume/latest renders the newest document', async ({ page }) => {
    const response = await page.goto('/resume/latest')

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', {
        level: 1,
      }),
    ).toHaveText('Resume Document')
    // `latest` is the newest by definition, so it never checks for newer ones.
    await expect(page.getByText('newer version of my resume')).toHaveCount(0)
    await expect(page.locator('#validate')).toBeVisible()
  })

  test('a superseded document links to the latest one', async ({ page }) => {
    const response = await page.goto(`/resume/${olderSlug}`)

    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', {
        level: 1,
      }),
    ).toHaveText('Resume Document')

    const banner = page.getByText('There is a newer version of my resume available')
    await expect(banner).toBeVisible()
    await banner
      .getByRole('link', {
        name: 'here',
      })
      .click()

    await expect(page).toHaveURL(/\/resume\/latest$/)
    await expect(
      page.getByRole('heading', {
        level: 1,
      }),
    ).toHaveText('Resume Document')
    await expect(banner).toBeHidden()
  })
})
