import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { waitClosingTab, waitTab } from './helpers'

export type BgFunctions = typeof bgFunctions

const bgFunctions = {
  // browser.tabs.* methods are not available in content scripts
  // so we have to use the background script as a proxy
  tabs_query: (params) => browser.tabs.query(params),
  tabs_update: (id, params) => browser.tabs.update(id, params),
  tabs_create: (params) => browser.tabs.create(params),
  tabs_remove: (id) => browser.tabs.remove(id),
  getThisTab: (callInfo) => callInfo?.sender?.tab,
  waitClosingTab: (tabId, windowId) => waitClosingTab(tabId, windowId),
  waitTab: (url) => waitTab(url),
}

browser.runtime.onMessage.addListener(setupMessageListener(bgFunctions))

const overlayPopupOpen = (tab: browser.Tabs.Tab) => {
  browser.tabs.sendMessage(tab.id, { type: 'OPEN_POPUP' })
}

const updateAction = async (tabId: number) => {
  const tab = await browser.tabs.get(tabId)

  // A normal site where the extension can work
  if (tab?.url.startsWith('https://') || tab?.url.startsWith('http://')) {
    // The script may not be injected if the extension was just installed
    const isContentScriptInjected = await browser.tabs
      .sendMessage(tab.id, { type: 'PING' }) // The CS must reply 'PONG'
      .then(() => true)
      .catch(() => false)

    if (isContentScriptInjected) {
      await browser.action.setPopup({ tabId, popup: '' })
      browser.action.onClicked.addListener(overlayPopupOpen)
    } else {
      const popupUrl = browser.runtime.getURL('popup.html?page=no-cs-injected')
      await browser.action.setPopup({ tabId, popup: popupUrl })
      browser.action.onClicked.removeListener(overlayPopupOpen)
    }
  } else {
    // If it's a system tab where the extension doesn't work
    const popupUrl = browser.runtime.getURL('popup.html?page=unsupported-page')
    await browser.action.setPopup({ tabId, popup: popupUrl })
    browser.action.onClicked.removeListener(overlayPopupOpen)
  }
}

browser.tabs.onActivated.addListener(({ tabId }) => updateAction(tabId))
browser.tabs.onUpdated.addListener((tabId) => updateAction(tabId))
