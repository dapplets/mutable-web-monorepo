import browser from 'webextension-polyfill'

export async function waitClosingTab(tabId: number, windowId: number) {
  return new Promise<void>((res) => {
    const handler = (_tabId, removeInfo) => {
      if (_tabId === tabId && windowId === removeInfo.windowId) {
        res()
        browser.tabs.onRemoved.removeListener(handler)
      }
    }
    browser.tabs.onRemoved.addListener(handler)
  })
}

export async function waitTab(url: string) {
  const expectedUrl = new URL(url)

  const isEqualUrlParams = (expectedUrl: URL, receivedUrl: URL): boolean => {
    if (expectedUrl.origin !== receivedUrl.origin) return false
    if (expectedUrl.pathname !== receivedUrl.pathname) return false

    const entries: { [key: string]: string } = {}
    expectedUrl.searchParams.forEach((v, k) => (entries[k] = v))

    for (const key in entries) {
      if (
        !receivedUrl.searchParams.has(key) ||
        entries[key] !== receivedUrl.searchParams.get(key)
      ) {
        return false
      }
    }

    return true
  }

  return new Promise<browser.Tabs.Tab>((res) => {
    const handler = async (tabId: number) => {
      const tab = await browser.tabs.get(tabId)
      const receivedUrl = new URL(tab.url)
      if (isEqualUrlParams(expectedUrl, receivedUrl)) {
        res(tab)
        browser.tabs.onUpdated.removeListener(handler)
      }
    }
    browser.tabs.onUpdated.addListener(handler)
  })
}
