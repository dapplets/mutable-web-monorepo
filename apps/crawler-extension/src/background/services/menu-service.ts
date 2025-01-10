import browser from 'webextension-polyfill'
import { debounce } from '../helpers'
import { connectWallet, disconnectWallet, near_getAccounts } from './wallet-service'
import { getCurrentNetwork, switchNetwork } from './settings-service'

// Context menu actions

const setClipboard = async (tab: browser.Tabs.Tab, address: string): Promise<void> => {
  if (!tab.id) return
  await browser.tabs.sendMessage(tab.id, { type: 'COPY', address })
}

const copy = async (info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) => {
  setClipboard(tab, (await near_getAccounts())[0].accountId)
}

// Context menu updaters

const updateNetworkMenu = async () => {
  const networkId = await getCurrentNetwork()
  const networkMenuId = browser.contextMenus.create({
    title: 'Switch network',
    id: 'network',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Mainnet',
    parentId: networkMenuId,
    id: 'mainnet',
    contexts: ['action'],
    checked: networkId === 'mainnet',
    type: 'radio',
  })
  browser.contextMenus.create({
    title: 'Testnet',
    parentId: networkMenuId,
    id: 'testnet',
    contexts: ['action'],
    checked: networkId === 'testnet',
    type: 'radio',
  })
}

export const updateMenuForDisconnectedState = async () => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })

  await updateNetworkMenu()
}

export const updateMenuForConnectedState = async (accountName: string) => {
  browser.contextMenus.removeAll()
  const walletMenuId = browser.contextMenus.create({
    title: accountName,
    id: 'wallet',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Copy address',
    parentId: walletMenuId,
    id: 'copy',
    contexts: ['action'],
    enabled: false,
  })
  browser.contextMenus.create({
    title: 'Disconnect NEAR wallet',
    parentId: walletMenuId,
    id: 'disconnect',
    contexts: ['action'],
  })

  await updateNetworkMenu()
}

// Set context menu

const setActionMenu = async (): Promise<void> => {
  const accounts = await near_getAccounts()
  if (accounts.length) {
    await updateMenuForConnectedState(accounts[0].accountId)
  } else {
    await updateMenuForDisconnectedState()
  }
}

// ToDo: workaround
setTimeout(() => setActionMenu(), 1000)

// Set availability for copy address

const setCopyAvailability = async (tabId: number) => {
  const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
  if (!currentTab || tabId !== currentTab.id) return
  // The script may not be injected if the extension was just installed
  const isContentScriptInjected = await browser.tabs
    .sendMessage(currentTab.id, { type: 'PING' }) // The CS must reply 'PONG'
    .then(() => true)
    .catch(() => false)
  browser.contextMenus
    .update('copy', { enabled: isContentScriptInjected })
    .then(() => true)
    .catch(() => false)
}

const debouncedFn = debounce(setCopyAvailability, 1000)

browser.tabs.onActivated.addListener((a) => debouncedFn(a.tabId))
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active) debouncedFn(tabId)
})

// Context menu actions routing

function handleContextMenuClick(
  info: browser.Menus.OnClickData,
  tab: browser.Tabs.Tab | undefined
) {
  switch (info.menuItemId) {
    case 'connect':
      return connectWallet()

    case 'disconnect':
      return disconnectWallet()

    case 'copy': {
      if (tab) {
        return copy(info, tab)
      }
      break
    }

    case 'testnet':
      return switchNetwork('testnet')

    case 'mainnet':
      return switchNetwork('mainnet')

    default:
      console.log('There is no such a menu command')
  }
}
browser.contextMenus.onClicked.addListener(handleContextMenuClick)

export async function setIsError(isError: boolean, __request?: any) {
  const tab = __request?.sender?.tab as browser.Tabs.Tab
  if (!tab) return

  const tabId = tab.id

  await Promise.all([
    browser.action.setBadgeBackgroundColor({ color: '#DB504A', tabId }),
    browser.action.setBadgeTextColor({ color: '#ffffff', tabId }),
    browser.action.setBadgeText({ text: isError ? '!' : '', tabId }),
  ])
}
