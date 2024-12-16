import { SignInParams } from '@near-wallet-selector/core'
import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { MUTATION_LINK_URL } from '../common/constants'
import { DefaultNetworkId, NearNetworkId, networkConfigs } from '../common/networks'
import { debounce } from './helpers'
import { TabStateService } from './services/tab-state-service'
import { WalletImpl } from './wallet'

const getCurrentNetwork = async (): Promise<NearNetworkId> => {
  return browser.storage.local
    .get('networkId')
    .then(({ networkId }) => networkId ?? DefaultNetworkId)
}

const switchNetwork = async (networkId: NearNetworkId) => {
  await browser.storage.local.set({ networkId })
  browser.runtime.reload()
}

const networkConfigPromise = getCurrentNetwork().then((networkId) => networkConfigs[networkId])

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

const getDevServerUrl = async (): Promise<string | null> => {
  const { devServerUrl } = await browser.storage.local.get('devServerUrl')
  return devServerUrl ? devServerUrl : null
}

const setDevServerUrl = async (devServerUrl: string | null): Promise<void> => {
  await browser.storage.local.set({ devServerUrl })
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
  getCurrentNetwork,
  getDevServerUrl,
  setDevServerUrl,
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

const openNewMutationPopup = (tab: browser.Tabs.Tab) => {
  tab?.id && browser.tabs.sendMessage(tab.id, { type: 'OPEN_NEW_MUTATION_POPUP' })
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

const updateMenuForDisconnectedState = async () => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })
  browser.contextMenus.create({
    title: 'Mutate',
    id: 'mutate',
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
  browser.contextMenus.create({
    title: 'Mutate',
    id: 'mutate',
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

    case 'mutate':
      if (tab) {
        return openNewMutationPopup(tab)
      }
      break

    case 'testnet':
      return switchNetwork('testnet')

    case 'mainnet':
      return switchNetwork('mainnet')

    default:
      console.log('There is no such a menu command')
  }
}
browser.contextMenus.onClicked.addListener(handleContextMenuClick)

// Redirect from share link with mutations
const mutationLinkListener = async (tabId: number | undefined) => {
  if (!tabId) return

  const tab = await browser.tabs.get(tabId)

  // Prevent concurrency
  if (!tab || tab.status !== 'complete' || !tab.url) return

  if (tab?.url.startsWith(MUTATION_LINK_URL)) {
    const url = new URL(tab.url)

    // URL example:
    // https://augm.link/mutate?t=https://twitter.com/MrConCreator&m=bos.dapplets.near/mutation/Zoo
    if (url.pathname === '/mutate' || url.pathname === '/mutate/') {
      const redirectUrl = url.searchParams.get('t')
      const mutationId = url.searchParams.get('m')

      if (!redirectUrl || !mutationId) return

      // Add mutationId to the queue. It will be fetch later, when the page loaded
      tabStateService.push(tabId, { mutationId })

      await browser.tabs.update(tabId, { url: redirectUrl, active: true })
    }
  }
}

browser.runtime.onInstalled.addListener(async () => {
  const serviceTabs = await browser.tabs.query({
    url: `${new URL('/', MUTATION_LINK_URL).href}*`,
  })

  await Promise.all(serviceTabs.map((tab) => mutationLinkListener(tab.id)))
})

browser.tabs.onActivated.addListener(({ tabId }) => mutationLinkListener(tabId))
browser.tabs.onUpdated.addListener((tabId) => mutationLinkListener(tabId))
