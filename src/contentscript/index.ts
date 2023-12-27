import { setupWalletSelector } from '@near-wallet-selector/core'
import { Engine } from 'mutable-web-engine'
import browser from 'webextension-polyfill'
import { ExtensionStorage } from './extension-storage'
import { setupWallet } from './wallet'

const NetworkId = 'mainnet'
const DefaultContractId = 'social.near' // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user

async function main() {
  // The wallet selector looks like an unnecessary abstraction layer over the background wallet
  // but we have to use it because near-social-vm uses not only a wallet object, but also a selector state
  // object and its Observable for event subscription
  const selectorPromise = setupWalletSelector({
    network: NetworkId,
    // The storage is faked because it's not necessary. The selected wallet ID is hardcoded below
    storage: new ExtensionStorage(),
    modules: [
      setupWallet({
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://app.mynearwallet.com',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.near.org',
      }),
    ],
  }).then((selector) => {
    // Use background wallet by default
    const wallet = selector.wallet
    selector.wallet = () => wallet('background')
    return selector
  })

  const engine = new Engine({
    networkId: NetworkId,
    selector: selectorPromise, // near-social-vm requires a Promise
  })

  await engine.start()

  console.log('Mutable Web Engine started!', engine)

  browser.runtime.onMessage.addListener((message) => {
    if (!message || !message.type) return

    if (message.type === 'PING') {
      // Used for background. When user clicks on the extension icon, content script may be not injected.
      // It's a way to check liveness of the content script
      return Promise.resolve('PONG')
    } else if (message.type === 'OPEN_POPUP') {
      selectorPromise.then((selector) => {
        selector.wallet().then((wallet) => {
          wallet.signIn({
            contractId: DefaultContractId,
            accounts: [],
          })
        })
      })
    }
  })
}

main().catch(console.error)
