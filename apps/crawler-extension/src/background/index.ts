import { SignInParams } from '@near-wallet-selector/core'
import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { networkConfigs } from '../common/networks'
import { debounce } from './helpers'
import * as SettingsService from './services/settings-service'
import { TabStateService } from './services/tab-state-service'
import { WalletImpl } from './wallet'
import * as ChatGptService from './services/chatgpt-service'
import * as LocalParserService from './services/local-parser-service'
import * as ContextService from './services/context-service'

const networkConfigPromise = SettingsService.getCurrentNetwork().then(
  (networkId) => networkConfigs[networkId]
)

// Services

const tabStateService = new TabStateService()

// NEAR wallet

const near = new WalletImpl(networkConfigPromise)

const connectWallet = async (): Promise<void> => {
  const { socialDbContract } = await networkConfigPromise

  const params: Partial<SignInParams> = {
    // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user
    contractId: socialDbContract,
    methodNames: [],
  }
  const accounts = await near.signIn(params)

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
      if (!tab.id) return
      browser.tabs.sendMessage(tab.id, {
        type: 'SIGNED_IN',
        params: {
          ...params,
          accounts,
        },
      })
    })
  )

  updateMenuForConnectedState(accounts[0].accountId)
}

const disconnectWallet = async (): Promise<void> => {
  await near.signOut()

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
      if (!tab.id) return
      browser.tabs.sendMessage(tab.id, { type: 'SIGNED_OUT' })
    })
  )
  updateMenuForDisconnectedState()
}

export const bgFunctions = {
  near_signIn: near.signIn.bind(near),
  near_signOut: near.signOut.bind(near),
  near_getAccounts: near.getAccounts.bind(near),
  near_signAndSendTransaction: near.signAndSendTransaction.bind(near),
  near_signAndSendTransactions: near.signAndSendTransactions.bind(near),
  popTabState: tabStateService.popForTab.bind(tabStateService),
  connectWallet,
  disconnectWallet,
  ...SettingsService,
  ...ChatGptService,
  ...LocalParserService,
  ...ContextService,
}

export type BgFunctions = typeof bgFunctions

browser.runtime.onMessage.addListener(setupMessageListener(bgFunctions))

// Context menu actions

const setClipboard = async (tab: browser.Tabs.Tab, address: string): Promise<void> => {
  if (!tab.id) return
  await browser.tabs.sendMessage(tab.id, { type: 'COPY', address })
}

const copy = async (info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) => {
  setClipboard(tab, (await near.getAccounts())[0].accountId)
}

// Context menu updaters

const updateNetworkMenu = async () => {
  const networkId = await SettingsService.getCurrentNetwork()
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

const updateMenuForDisconnectedState = async () => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })

  await updateNetworkMenu()
}

const updateMenuForConnectedState = async (accountName: string) => {
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
  const accounts = await near.getAccounts()
  if (accounts.length) {
    await updateMenuForConnectedState(accounts[0].accountId)
  } else {
    await updateMenuForDisconnectedState()
  }
}

setActionMenu()

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
      return SettingsService.switchNetwork('testnet')

    case 'mainnet':
      return SettingsService.switchNetwork('mainnet')

    default:
      console.log('There is no such a menu command')
  }
}
browser.contextMenus.onClicked.addListener(handleContextMenuClick)
