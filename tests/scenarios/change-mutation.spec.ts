import { expect, test } from '../fixtures/browser'
import { MutablePanel } from '../pages/mutable-panel'
// ToDo: qase mw-1
test('change mutation', async ({ page }) => {
  const mutablePanel = new MutablePanel(page)

  await page.goto('https://github.com/dapplets/dapplet-extension/pull/217')

  await page.waitForTimeout(5000)
  await expect(page.getByTestId('mutable-panel')).toBeVisible()
  await expect(page.getByTestId('selected-mutation-name')).toContainText('Sandbox')
  await mutablePanel.clickToggle()
  await expect(page.getByTestId('selected-mutation-name')).toContainText('Zoo')
})
