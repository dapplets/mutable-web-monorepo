import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { debounce } from './helpers'
import { WalletImpl, WalletParams } from './wallet'

const DEFAULT_CONTRACT_ID = 'social.near' // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user

const walletConfig: WalletParams = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://app.mynearwallet.com',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.near.org',
}

const near = new WalletImpl(walletConfig)

export const bgFunctions = {
  near_signIn: near.signIn.bind(near),
  near_signOut: near.signOut.bind(near),
  near_getAccounts: near.getAccounts.bind(near),
  near_signAndSendTransaction: near.signAndSendTransaction.bind(near),
  near_signAndSendTransactions: near.signAndSendTransactions.bind(near),
}

export type BgFunctions = typeof bgFunctions

browser.runtime.onMessage.addListener(setupMessageListener(bgFunctions))

const setClipboard = async (tab: browser.Tabs.Tab, address: string): Promise<void> =>
  browser.tabs.sendMessage(tab.id, { type: 'COPY', address })

const connectWallet = async (
  info: browser.Menus.OnClickData,
  tab: browser.Tabs.Tab
): Promise<void> => {
  const id = await near.signIn({
    contractId: DEFAULT_CONTRACT_ID,
    methodNames: [],
  })
  browser.tabs.sendMessage(tab.id, { type: 'RESTART' })
  recreateMenuForConnectedState(id[0].accountId)
}

const disconnect = async (
  info: browser.Menus.OnClickData,
  tab: browser.Tabs.Tab
): Promise<void> => {
  await near.signOut()
  browser.tabs.sendMessage(tab.id, { type: 'RESTART' })
  recreateMenuForDisconnectedState()
}

const copy = async (info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) => {
  setClipboard(tab, (await near.getAccounts())[0].accountId)
}

const recreateMenuForDisconnectedState = (): void => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })
}

const recreateMenuForConnectedState = (accountName: string): void => {
  browser.contextMenus.removeAll()
  const parentContextMenuId = browser.contextMenus.create({
    title: accountName,
    id: 'wallet',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Copy address',
    parentId: parentContextMenuId,
    id: 'copy',
    contexts: ['action'],
    enabled: false,
  })
  browser.contextMenus.create({
    title: 'Disconnect NEAR wallet',
    parentId: parentContextMenuId,
    id: 'disconnect',
    contexts: ['action'],
  })
}

const updateActionMenu = async (): Promise<void> => {
  const accounts = await near.getAccounts()
  if (accounts.length) recreateMenuForConnectedState(accounts[0].accountId)
  else recreateMenuForDisconnectedState()
}

function handleContextMenuClick(info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) {
  switch (info.menuItemId) {
    case 'connect':
      return connectWallet(info, tab)

    case 'disconnect':
      return disconnect(info, tab)

    case 'copy':
      return copy(info, tab)

    default:
      break
  }
}

browser.runtime.onInstalled.addListener(updateActionMenu)

const setCopyAvailability = async (tabId: number) => {
  // The script may not be injected if the extension was just installed
  const isContentScriptInjected = await browser.tabs
    .sendMessage(tabId, { type: 'PING' }) // The CS must reply 'PONG'
    .then(() => true)
    .catch(() => false)
  browser.contextMenus
    .update('copy', { enabled: isContentScriptInjected })
    .then(() => true)
    .catch(() => false)
}

const debouncedFn = debounce(setCopyAvailability, 1000)

browser.tabs.onUpdated.addListener((tabId) => debouncedFn(tabId))
browser.tabs.onActivated.addListener((a) => debouncedFn(a.tabId))
browser.contextMenus.onClicked.addListener(handleContextMenuClick)
