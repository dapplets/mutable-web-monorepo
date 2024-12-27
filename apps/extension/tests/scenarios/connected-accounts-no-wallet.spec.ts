import { expect, test } from '../fixtures/browser'

test('show empty Connected Accounts list on a Profile page when the no wallets connected', async ({
  page,
}) => {
  const url = 'https://github.com/dapplets/dapplet-extension/pull/217'
  const noConnectedAccountsText = 'There are no connected accounts'
  const recommendConnectWalletText = 'Connect your wallet to see connected accounts'

  await page.goto(url)

  // ToDo: move to POM
  await expect(page.getByTestId('mweb-overlay')).toBeVisible({ timeout: 60_000 })

  // actions
  await page.getByTestId('profile-action-button').click()

  // results
  await expect(page.getByTestId('side-panel')).toBeVisible()
  await expect(
    page.getByTestId('profile-page').getByTestId('connected-accounts-module')
  ).toBeVisible()
  await expect(
    page.getByTestId('profile-page').getByTestId('connected-accounts-module')
  ).toContainText(noConnectedAccountsText)
  await expect(
    page.getByTestId('profile-page').getByTestId('connected-accounts-module')
  ).toContainText(recommendConnectWalletText)
})
