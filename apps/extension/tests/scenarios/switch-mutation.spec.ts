import { expect, test } from '../fixtures/browser'

// ToDo: qase mw-1
test('switch mutation', async ({ page }) => {
  const url = 'https://github.com/dapplets/dapplet-extension/pull/217'
  const sourceMutationId = 'bos.dapplets.near/mutation/Sandbox'
  const sourceMutationContent = 'Welcome by bos.dapplets.near'
  const targetMutationId = 'bos.dapplets.near/mutation/Zoo'
  const targetMutationContent = 'Zoo by bos.dapplets.near'

  await page.goto(url)

  // ToDo: move to POM
  await expect(page.getByTestId('mweb-overlay')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('mutation-button').click()
  await expect(page.getByTestId('side-panel')).toBeVisible()
  await expect(page.getByTestId('side-panel').getByTestId('recently-used-mutations')).toContainText(
    sourceMutationContent
  )
  await expect(page.getByTestId('side-panel').getByTestId(sourceMutationId)).toHaveClass(
    /active-mutation/
  )

  // actions
  await page.getByTestId('side-panel').getByTestId('unused-mutations-title').click()
  await page.getByTestId('side-panel').getByTestId(targetMutationId).click()

  // results
  await expect(page.getByTestId('side-panel').getByTestId('recently-used-mutations')).toContainText(
    targetMutationContent
  )

  // The order is important!
  // 1.
  await expect(page.getByTestId('side-panel').getByTestId(targetMutationId)).toHaveClass(
    /active-mutation/,
    { timeout: 30_000 }
  )
  // 2.
  await expect(page.getByTestId('side-panel').getByTestId(sourceMutationId)).not.toHaveClass(
    /active-mutation/
  )
})
