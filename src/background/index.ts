import { setupMessageListener } from 'chrome-extension-message-wrapper'
import browser from 'webextension-polyfill'
import { MUTATION_LINK_URL } from '../common/constants'
import { networkConfig } from '../common/networks'
import { MessageWrapperRequest } from '../common/types'
import { debounce } from './helpers'
import { TabStateService } from './services/tab-state-service'
import { WalletImpl } from './wallet'

// Services

const tabStateService = new TabStateService()

// NEAR wallet

const near = new WalletImpl(networkConfig)

export const bgFunctions = {
  near_signIn: near.signIn.bind(near),
  near_signOut: near.signOut.bind(near),
  near_getAccounts: near.getAccounts.bind(near),
  near_signAndSendTransaction: near.signAndSendTransaction.bind(near),
  near_signAndSendTransactions: near.signAndSendTransactions.bind(near),
  popTabState: (req?: MessageWrapperRequest) => tabStateService.pop(req?.sender?.tab?.id),
}

export type BgFunctions = typeof bgFunctions

browser.runtime.onMessage.addListener(setupMessageListener(bgFunctions))

// Context menu actions

const setClipboard = async (tab: browser.Tabs.Tab, address: string): Promise<void> =>
  browser.tabs.sendMessage(tab.id, { type: 'COPY', address })

const connectWallet = async (): Promise<void> => {
  const params = {
    // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user
    contractId: networkConfig.socialDbContract,
    methodNames: [],
  }
  const accounts = await near.signIn(params)

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
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

const disconnect = async (): Promise<void> => {
  await near.signOut()

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
      browser.tabs.sendMessage(tab.id, { type: 'SIGNED_OUT' })
    })
  )
  updateMenuForDisconnectedState()
}

const copy = async (info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) => {
  setClipboard(tab, (await near.getAccounts())[0].accountId)
}

// Context menu updaters

const updateMenuForDisconnectedState = (): void => {
  browser.contextMenus.removeAll()
  browser.contextMenus.create({
    title: 'Connect NEAR wallet',
    id: 'connect',
    contexts: ['action'],
  })
}

const updateMenuForConnectedState = (accountName: string): void => {
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

// Set context menu

const setActionMenu = async (): Promise<void> => {
  const accounts = await near.getAccounts()
  if (accounts.length) updateMenuForConnectedState(accounts[0].accountId)
  else updateMenuForDisconnectedState()
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

function handleContextMenuClick(info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) {
  switch (info.menuItemId) {
    case 'connect':
      return connectWallet()

    case 'disconnect':
      return disconnect()

    case 'copy':
      return copy(info, tab)

    default:
      break
  }
}
browser.contextMenus.onClicked.addListener(handleContextMenuClick)

// Redirect from share link with mutations
const mutationLinkListener = async (tabId: number) => {
  const tab = await browser.tabs.get(tabId)

  // Prevent concurrency
  if (tab.status !== 'complete') return

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
