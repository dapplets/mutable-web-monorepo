import type { Locator, Page } from '@playwright/test'

export class MutablePanel {
  public readonly root: Locator
  public readonly profile: Locator

  constructor(public readonly page: Page) {
    this.root = this.page.locator('#mutable-panel')
  }

  async clickToggle() {
    await this.root.getByTestId('mutable-panel-dropdown').click()
    await this.root.getByTestId('selected-mutation-name-Zoo').click()
  }

}
