import { expect, test } from '../fixtures/browser'

test('open Profile page through the button in Mini Overlay', async ({ page }) => {
  const url = 'https://github.com/dapplets/dapplet-extension/pull/217'

  await page.goto(url)

  // ToDo: move to POM
  await expect(page.getByTestId('mweb-overlay')).toBeVisible({ timeout: 60_000 })

  // actions
  await page.getByTestId('profile-action-button').click()

  // results
  await expect(page.getByTestId('side-panel')).toBeVisible()
  await expect(page.getByTestId('profile-page')).toBeVisible()
})
