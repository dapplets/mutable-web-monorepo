import { TransactionRequest } from '@ethersproject/providers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { detect } from 'detect-browser'
import { ethers } from 'ethers'
import PortStream from 'extension-port-stream'
import browser from 'webextension-polyfill'
import MWebIcon from '../../../../resources/icons/icon128.png' // ToDo: replace to walletIcons.metamask
import EventEmitter from 'events'

export default class extends ethers.Signer {
  public provider: ethers.providers.StaticJsonRpcProvider
  private _metamaskProviderPromise: Promise<MetaMaskInpageProvider> | null = null
  private _isMetamaskInitialized = false
  private _eventEmitter: EventEmitter

  constructor(eventEmitter: EventEmitter) {
    super()
    this.provider = new ethers.providers.StaticJsonRpcProvider()
    this._eventEmitter = eventEmitter
  }

  async getAddress(): Promise<string> {
    try {
      const addresses = await this.getAddresses()
      return addresses?.[0] || ''
    } catch (_) {
      return ''
    }
  }

  async getAddresses(): Promise<string[] | null> {
    try {
      const metamask = await this._getMetamaskProvider()
      return metamask.request({ method: 'eth_accounts', params: [] }) as Promise<string[]>
    } catch (_) {
      return null
    }
  }

  async signMessage(message: string | ethers.Bytes): Promise<string> {
    const metamask = await this._getMetamaskProvider()
    const address = await this.getAddress()
    return (await metamask.request({
      method: 'personal_sign',
      params: [message, address.toLowerCase()],
    })) as string
  }

  async signTransaction(): Promise<string> {
    throw new NotImplementedError()
  }

  async sendTransaction(
    transaction: TransactionRequest
  ): Promise<ethers.providers.TransactionResponse> {
    const txHash = await this.sendTransactionOutHash(transaction)

    // the wait of a transaction from another provider can be long
    let tx = null
    while (tx === null) {
      await new Promise((res) => setTimeout(res, 1000))
      tx = await this.provider.getTransaction(txHash)
    }

    return tx
  }

  async sendTransactionOutHash(transaction: TransactionRequest): Promise<string> {
    const metamask = await this._getMetamaskProvider()
    await browser.storage.local.set({ metamask_lastUsage: new Date().toISOString() })
    transaction.from = await this.getAddress()
    const tx = await ethers.utils.resolveProperties(transaction)
    const txHash = (await metamask.request({
      method: 'eth_sendTransaction',
      params: [tx],
    })) as string
    return txHash
  }

  async sendCustomRequest(method: string, params: any[]): Promise<any> {
    const metamask = await this._getMetamaskProvider()
    return metamask.request({ method, params })
  }

  connect(): ethers.Signer {
    throw new NotImplementedError()
  }

  async isAvailable() {
    try {
      await this._getMetamaskProvider()
      return true
    } catch (_) {
      return false
    }
  }

  async isConnected() {
    const disabled =
      (await browser.storage.local.get('metamask_disabled')).metamask_disabled === 'true'
    if (disabled) return false

    try {
      const metamask = await this._getMetamaskProvider()
      return metamask.isConnected() && !!metamask.selectedAddress
    } catch (_) {
      return false
    }
  }

  // @CacheMethod() // ToDo: is it critical?
  async connectWallet(): Promise<void> {
    const metamask = await this._getMetamaskProvider()
    const isMetamaskDisabled = await browser.storage.local.get('metamask_disabled')
    if (isMetamaskDisabled.metamask_disabled === 'true') {
      const permissions = await metamask.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
      await browser.storage.local.remove('metamask_disabled')
      const selectedAddress = await this.getAddress()
      const accounts = permissions
        ? (permissions as any[])[0].caveats[0].value
        : await this.getAddresses()

      // send events to all tabs
      this._eventEmitter.emit('signedInEthereum', {
        account: selectedAddress,
        accounts,
      })
    } else {
      const accounts = await metamask.request({ method: 'eth_requestAccounts' })
      const selectedAddress = await this.getAddress()

      // send events to all tabs
      this._eventEmitter.emit('signedInEthereum', { account: selectedAddress, accounts })
    }
    await browser.storage.local.set({ metamask_disabled: new Date().toISOString() })
  }

  async disconnectWallet() {
    const metamask = await this._getMetamaskProvider()
    await metamask.request({
      method: 'wallet_revokePermissions',
      params: [
        {
          eth_accounts: {},
        },
      ],
    })
    await browser.storage.local.set({ metamask_disabled: 'true' })
    browser.storage.local.remove('metamask_lastUsage')
    // send events to all tabs
    this._eventEmitter.emit('signedOutEthereum', { accounts: [] })
  }

  async getMeta() {
    return {
      name: 'MetaMask',
      description: 'MetaMask Browser Extension',
      icon: '', // walletIcons['metamask'], ToDo: add icon
    }
  }

  async getLastUsage() {
    return (
      ((await browser.storage.local.get('metamask_lastUsage')).metamask_lastUsage as string) ?? ''
    )
  }

  async getWalletChainId(): Promise<number> {
    const metamask = await this._getMetamaskProvider()
    const chainId = await metamask.request({
      method: 'eth_chainId',
      params: [],
    })
    return Number(chainId)
  }

  async getWalletChainName(): Promise<string | null> {
    const chainId = await this.getWalletChainId()
    if (!chainId) return null
    return ethers.providers.getNetwork(chainId)?.name
  }

  private async _subscribeForMetamaskEvents() {
    const metamask = await this._getMetamaskProvider()
    metamask.on('connect', async (...args) => {
      // console.log('metamask connected', args)
      // MV3 Extension doesn't have HTML-based background pages where favicon can be defined
      // We use the undocumented method metamask_sendDomainMetadata to manually provide metadata
      // https://github.com/MetaMask/providers/blob/6206aada4b1a8c14912fc9b0fcd0ec922d41251b/src/siteMetadata.ts#L23
      this.connectWallet()
    })
    metamask.on('disconnect', async () => {
      // console.log('metamask disconnected')
      this._metamaskProviderPromise = null
      this.disconnectWallet()
    })
    metamask.on('chainChanged', async (...args) => {
      // console.log('chainChanged', args)
      const chainName = await this.getWalletChainName()
      this._eventEmitter.emit('ethChainChanged', { chainName })
    })
    // metamask.on('networkChanged', (...args) => console.log('networkChanged', args))
    metamask.on('accountsChanged', async (...args) => {
      // console.log('accountsChanged', args)
      const selectedAddress = await this.getAddress()
      this._eventEmitter.emit('ethAccountsChanged', {
        account: selectedAddress,
        accounts: args[0],
      })
    })
    metamask.on('message', (...args) => console.log('message', args))
    metamask.on('data', (...args) => console.log('data', args))
  }

  private async _getMetamaskProvider(): Promise<MetaMaskInpageProvider> {
    if (!this._metamaskProviderPromise || !this._isMetamaskInitialized) {
      this._metamaskProviderPromise = new Promise((res, rej) => {
        const currentMetaMaskId = this._getMetaMaskId()
        const metamaskPort = browser.runtime.connect(currentMetaMaskId)
        metamaskPort.onDisconnect.addListener(() => browser.runtime.lastError) // mute "Unchecked runtime.lastError"
        const pluginStream = new PortStream(metamaskPort)
        const metamask = new MetaMaskInpageProvider(pluginStream as any, {
          // mute all messages from provider
          logger: {
            warn: () => {},
            log: () => {},
            error: () => {},
            debug: () => {},
            info: () => {},
            trace: () => {},
          },
        })
        // metamask['autoRefreshOnNetworkChange'] = false // silence the warning from metamask https://docs.metamask.io/guide/ethereum-provider.html#ethereum-autorefreshonnetworkchange // ToDo: do we have this warning?
        metamask.on('connect', (...args) => {
          // console.log('metamask connected', args)
          // MV3 Extension doesn't have HTML-based background pages where favicon can be defined
          // We use the undocumented method metamask_sendDomainMetadata to manually provide metadata
          // https://github.com/MetaMask/providers/blob/6206aada4b1a8c14912fc9b0fcd0ec922d41251b/src/siteMetadata.ts#L23
          metamask.request({
            method: 'metamask_sendDomainMetadata',
            params: {
              name: 'Mutable Web',
              icon: MWebIcon,
              uuid: crypto.randomUUID(),
              rdns: 'eth.mutable-web.metamask',
            },
          })
          res(metamask)
        })
        metamask.on('disconnect', () => {
          // console.log('metamask disconnected')
          this._metamaskProviderPromise = null
          rej('MetaMask is unavailable.')
        })
        metamask.on('_initialized', async (...args) => {
          // console.log('_initialized', args)
          // console.log('this._isMetamaskInitialized', this._isMetamaskInitialized)
          this._isMetamaskInitialized = true
          metamask.removeAllListeners()
          this._subscribeForMetamaskEvents()
        })
      })
    }

    return this._metamaskProviderPromise
  }

  private _getMetaMaskId() {
    const config = {
      CHROME_ID: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
      FIREFOX_ID: 'webextension@metamask.io',
    }
    const browser = detect()
    switch (browser && browser.name) {
      case 'chrome':
        return config.CHROME_ID
      case 'firefox':
        return config.FIREFOX_ID
      default:
        return config.CHROME_ID
    }
  }
}

class NotImplementedError extends Error {
  constructor() {
    super('The method or operation is not implemented.')
  }
}
