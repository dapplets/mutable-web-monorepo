import { SignInParams } from '@near-wallet-selector/core'
import { setupMessageListener } from '../common/messenger'
import browser from 'webextension-polyfill'
import { MUTATION_LINK_URL } from '../common/constants'
import { DefaultNetworkId, NearNetworkId, networkConfigs } from '../common/networks'
import { debounce } from './helpers'
import { TabStateService } from './services/tab-state-service'
import { EventEmitter as NEventEmitter } from 'events'
import ContentScript from '../common/content-script'
import SidePanel from '../common/sidepanel'
import Wallet from './wallets'
import { WalletTypes } from '@mweb/backend'

const eventEmitter = new NEventEmitter()

const getCurrentNetwork = async (): Promise<NearNetworkId> => {
  // @ts-ignore
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

const near = new Wallet[WalletTypes.MYNEARWALLET](networkConfigPromise)

const connectWallet = async (): Promise<void> => {
  const { socialDbContract } = await networkConfigPromise

  const params: Partial<SignInParams> = {
    // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user
    contractId: socialDbContract,
    methodNames: [],
  }
  const accounts = await near.signIn(params)

  // send events to all tabs
  eventEmitter.emit('signedIn', {
    ...params,
    accounts,
  })

  updateMenuForConnectedState(accounts[0].accountId)
}

const disconnectWallet = async (): Promise<void> => {
  await near.signOut()

  // send events to all tabs
  eventEmitter.emit('signedOut')

  updateMenuForDisconnectedState()
}

// MetaMask wallet

const ethereum = new Wallet[WalletTypes.METAMASK](eventEmitter)

// Dev server

const getDevServerUrl = async (): Promise<string | null> => {
  const { devServerUrl } = await browser.storage.local.get('devServerUrl')
  // @ts-ignore
  return devServerUrl ? devServerUrl : null
}

const setDevServerUrl = async (devServerUrl: string | null): Promise<void> => {
  await browser.storage.local.set({ devServerUrl })
}

// Side panel

const _toggleSidePanel = async (tabId: number) => {
  // !!! Workaround for user gesture error
  // We don't wait for the promise to resolve
  const isAlivePromise = SidePanel()
    .isAlive()
    .then(() => true)
    .catch(() => false)

  // @ts-ignore
  browser.sidePanel.setOptions({
    tabId: tabId,
    path: 'sidepanel.html',
    enabled: true,
  })

  // Open the side panel in any way
  // Don't wait for promise here too
  // @ts-ignore
  browser.sidePanel.open({ tabId })

  const isAlive = await isAlivePromise

  // And close it when promise resolves to true
  if (isAlive) {
    await SidePanel().close()
  }
}

const toggleSidePanel = async (req?: any) => {
  const tabId: number = req?.sender?.tab?.id

  if (!tabId) return

  await _toggleSidePanel(tabId)
}

const bgFunctions = {
  near_signIn: near.signIn.bind(near),
  near_signOut: near.signOut.bind(near),
  near_getAccounts: near.getAccounts.bind(near),
  near_signAndSendTransaction: near.signAndSendTransaction.bind(near),
  near_signAndSendTransactions: near.signAndSendTransactions.bind(near),
  popTabState: tabStateService.popForTab.bind(tabStateService),
  connectWallet,
  disconnectWallet,
  getCurrentNetwork,
  connectEthWallet: ethereum.connectWallet.bind(ethereum),
  disconnectEthWallet: ethereum.disconnectWallet.bind(ethereum),
  getEthAddresses: ethereum.getAddresses.bind(ethereum),
  getEthWalletChainName: ethereum.getWalletChainName.bind(ethereum),
  signEthMessage: ethereum.signMessage.bind(ethereum),
  sendEthTransaction: ethereum.sendTransaction.bind(ethereum),
  sendEthCustomRequest: ethereum.sendCustomRequest.bind(ethereum),
  getDevServerUrl,
  setDevServerUrl,
  toggleSidePanel,
}

export type BgFunctions = typeof bgFunctions

browser.runtime.onMessage.addListener(
  setupMessageListener(bgFunctions, { handlerName: 'bg' }) as any
)

// Context menu actions

const setClipboard = async (tab: browser.Tabs.Tab, address: string): Promise<void> => {
  if (!tab.id) return
  await ContentScript(tab.id).writeToClipboard(address)
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
  // The script may not be injected if the extension was just installed
  const isContentScriptInjected = await ContentScript(tabId)
    .isAlive()
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

const portConnectListener = async (port: browser.Runtime.Port) => {
  if (port.name === 'port-from-page') {
    const signInListener = (params: any) => port.postMessage({ type: 'signedIn', params })
    const signOutListener = () => port.postMessage({ type: 'signedOut' })
    const signInEthListener = (params: any) =>
      port.postMessage({ type: 'signedInEthereum', params })
    const signOutEthListener = (params: any) =>
      port.postMessage({ type: 'signedOutEthereum', params })
    const changeEthChainListener = (params: any) =>
      port.postMessage({ type: 'ethChainChanged', params })
    const changeEthAccountsListener = (params: any) =>
      port.postMessage({ type: 'ethAccountsChanged', params })

    eventEmitter.addListener('signedIn', signInListener)
    eventEmitter.addListener('signedOut', signOutListener)
    eventEmitter.addListener('signedInEthereum', signInEthListener)
    eventEmitter.addListener('signedOutEthereum', signOutEthListener)
    eventEmitter.addListener('ethChainChanged', changeEthChainListener)
    eventEmitter.addListener('ethAccountsChanged', changeEthAccountsListener)

    port.onDisconnect.addListener(() => {
      eventEmitter.removeListener('signedIn', signInListener)
      eventEmitter.removeListener('signedOut', signOutListener)
      eventEmitter.removeListener('signedInEthereum', signInEthListener)
      eventEmitter.removeListener('signedOutEthereum', signOutEthListener)
      eventEmitter.removeListener('ethChainChanged', changeEthChainListener)
      eventEmitter.removeListener('ethAccountsChanged', changeEthAccountsListener)
    })
  }
}

browser.runtime.onConnect.addListener(portConnectListener)

async function handleActionClick(tab: browser.Tabs.Tab) {
  if (!tab.id) return
  await _toggleSidePanel(tab.id)
}

const updateAction = async (tabId: number) => {
  const tab = await browser.tabs.get(tabId)
  // A normal site where the extension can work
  if (tab.id && (tab?.url?.startsWith('https://') || tab?.url?.startsWith('http://'))) {
    // The script may not be injected if the extension was just installed
    const isContentScriptInjected = await ContentScript(tabId)
      .isAlive()
      .then(() => true)
      .catch(() => false)

    if (isContentScriptInjected) {
      await browser.action.setPopup({ tabId, popup: '' })
      browser.action.onClicked.addListener(handleActionClick)
    } else {
      const popupUrl = browser.runtime.getURL('popup.html?page=no-cs-injected')
      await browser.action.setPopup({ tabId, popup: popupUrl })
      browser.action.onClicked.removeListener(handleActionClick)
    }
  } else {
    // If it's a system tab where the extension doesn't work
    const popupUrl = browser.runtime.getURL('popup.html?page=unsupported-page')
    await browser.action.setPopup({ tabId, popup: popupUrl })
    browser.action.onClicked.removeListener(handleActionClick)
  }
}

browser.tabs.onActivated.addListener(({ tabId }) => updateAction(tabId))
browser.tabs.onUpdated.addListener((tabId) => updateAction(tabId))
