import { expect, test } from '@playwright/test'

/**
 *    Content-level blog checks. Needs published posts in the database — CI
 *    runs `pnpm run seed:posts` before the suite; locally run
 *    `pnpm run seed:posts -- --count 2` first.
 */
test.describe('blog', () => {
  test('listing shows a post with title and excerpt', async ({ page }) => {
    await page.goto('/blog')

    const card = page.locator('a[href^="/blog/post/"]').first()
    await expect(card).toBeVisible()
    await expect(card.locator('h2')).not.toBeEmpty()
    await expect(card.locator('header p')).not.toBeEmpty()
  })

  test('post page renders the article', async ({ page }) => {
    await page.goto('/blog')

    const card = page.locator('a[href^="/blog/post/"]').first()
    const title = (await card.locator('h2').innerText()).trim()
    await card.click()

    // Under `next dev` the first visit compiles the post route before the
    // client navigation commits.
    await expect(page).toHaveURL(/\/blog\/post\/.+/, {
      timeout: 30_000,
    })
    // After the client navigation Next keeps the listing in the DOM, hidden;
    // a role query skips it.
    await expect(
      page.getByRole('heading', {
        level: 1,
      }),
    ).toContainText(title)
    await expect(page.locator('article')).not.toBeEmpty()
  })
})
