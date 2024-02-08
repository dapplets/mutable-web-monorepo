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

const getAccount = async (tabId: number): Promise<string | undefined> => {
  const accounts: {
    accountId: string
    publicKey: string
  }[] = await browser.tabs
    .sendMessage(tabId, { type: 'GET_ACCOUNTS' })
    .then((v) => v)
    .catch(() => false)
  return accounts[0]?.accountId
}

const setClipboard = async (tab: browser.Tabs.Tab): Promise<void> =>
  browser.tabs.sendMessage(tab.id, { type: 'COPY_ADDRESS' })

const connectWallet = (tab: browser.Tabs.Tab): Promise<void> =>
  browser.tabs
    .sendMessage(tab.id, { type: 'CONNECT' })
    .then(() => getAccount(tab.id))
    .then((accountName) => recreateMenuForConnectedState(accountName))

const disconnectWallet = (tab: browser.Tabs.Tab): Promise<void> =>
  browser.tabs
    .sendMessage(tab.id, { type: 'DISCONNECT' })
    .then(() => recreateMenuForDisconnectedState())

const copyOrDisconnect = (info: browser.Menus.OnClickData, tab: browser.Tabs.Tab): void => {
  if (info.menuItemId === 'disconnect') disconnectWallet(tab)
  else if (info.menuItemId === 'copy') setClipboard(tab)
}

const recreateMenuForDisconnectedState = (): void => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })
  browser.contextMenus.onClicked.removeListener(copyOrDisconnect)
  browser.contextMenus.onClicked.addListener((info, tab) => connectWallet(tab))
}

const recreateMenuForConnectedState = (accountName: string): void => {
  browser.contextMenus.removeAll()
  const parent = browser.contextMenus.create({
    title: accountName,
    id: 'wallet',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Copy address',
    parentId: parent,
    id: 'copy',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Disconnect NEAR wallet',
    parentId: parent,
    id: 'disconnect',
    contexts: ['action'],
  })
  browser.contextMenus.onClicked.removeListener((info, tab) => connectWallet(tab))
  browser.contextMenus.onClicked.addListener(copyOrDisconnect)
}

const updateActionMenu = async (tabId: number): Promise<void> => {
  const tab = await browser.tabs.get(tabId)

  // If it's a system tab where the extension doesn't work
  if (!(tab?.url.startsWith('https://') || tab?.url.startsWith('http://'))) {
    browser.contextMenus.removeAll()
    browser.contextMenus.onClicked.removeListener((info, tab) => connectWallet(tab))
    browser.contextMenus.onClicked.removeListener(copyOrDisconnect)
    return
  }

  // The script may not be injected if the extension was just installed
  const isContentScriptInjected = await browser.tabs
    .sendMessage(tab.id, { type: 'PING' }) // The CS must reply 'PONG'
    .then(() => true)
    .catch(() => false)

  if (!isContentScriptInjected) {
    browser.contextMenus.removeAll()
    browser.contextMenus.onClicked.removeListener((info, tab) => connectWallet(tab))
    browser.contextMenus.onClicked.removeListener(copyOrDisconnect)
    return
  }

  // A normal site where the extension can work
  const accountName: string | undefined = await getAccount(tab.id)

  if (accountName) recreateMenuForConnectedState(accountName)
  else recreateMenuForDisconnectedState()
}

browser.tabs.onActivated.addListener(({ tabId }) => updateActionMenu(tabId))
browser.tabs.onUpdated.addListener((tabId) => updateActionMenu(tabId))
