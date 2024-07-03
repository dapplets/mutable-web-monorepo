import { expect, test } from '../fixtures/browser'

// ToDo: qase mw-1
test('switch mutation', async ({ page }) => {
  const sourceMutationId = 'bos.dapplets.near/mutation/Sandbox'
  const targetMutationId = 'bos.dapplets.near/mutation/Zoo'
  const url = 'https://github.com/dapplets/dapplet-extension/pull/217'

  await page.goto(url)

  // ToDo: move to POM
  await expect(page.getByTestId('mutation-panel')).toBeVisible()
  await expect(page.getByTestId('selected-mutation-block')).toContainText(sourceMutationId)
  await page.getByTestId('selected-mutation-block').click()
  await page.getByText(targetMutationId).click()
  await expect(page.getByTestId('selected-mutation-block')).toContainText(targetMutationId)
})
