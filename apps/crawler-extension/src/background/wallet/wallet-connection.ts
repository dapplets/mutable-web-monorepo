import { serialize } from 'borsh'
import * as NearApiJs from 'near-api-js'
import { Near, KeyPair, InMemorySigner } from 'near-api-js'
import browser from 'webextension-polyfill'
import { generateGuid, waitClosingTab, waitTab } from '../helpers'
import { CustomConnectedWalletAccount } from './connected-wallet-account'

const LOGIN_WALLET_URL_SUFFIX = '/login/'
const PENDING_ACCESS_KEY_PREFIX = 'pending_key' // browser storage key for a pending access key (i.e. key has been generated but we are not sure it was added yet)

interface SignInOptions {
  contractId?: string
  methodNames?: string[]
  // TODO: Replace following with single callbackUrl
  successUrl?: string
  failureUrl?: string
}

interface RequestSignTransactionsOptions {
  transactions: NearApiJs.transactions.Transaction[]
  callbackUrl?: string
  meta?: string
}

export class CustomWalletConnection {
  _walletBaseUrl: string
  _authDataKey: string
  _keyStore: NearApiJs.keyStores.KeyStore
  _authData: { accountId?: string; allKeys?: string[] }
  _networkId: string
  _near: Near
  _connectedAccount?: CustomConnectedWalletAccount
  _completeSignInPromise?: Promise<void>

  constructor(
    near: Near,
    authData: { accountId?: string; allKeys?: string[] },
    authDataKey: string
  ) {
    this._near = near
    this._networkId = near.config.networkId
    this._walletBaseUrl = near.config.walletUrl
    this._keyStore = (near.connection.signer as InMemorySigner).keyStore
    this._authData = authData || { allKeys: [] }
    this._authDataKey = authDataKey
  }

  isSignedIn() {
    return !!this._authData.accountId
  }

  async isSignedInAsync() {
    if (!this._completeSignInPromise) {
      return this.isSignedIn()
    }

    await this._completeSignInPromise
    return this.isSignedIn()
  }

  getAccountId() {
    return this._authData.accountId || ''
  }

  async requestSignIn({ contractId, methodNames }: SignInOptions) {
    // ToDo: why this function became async?
    const expectedAccountId = await this.getAccountId()

    const [currentTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true })
    const currentTabId = currentTab.id

    const requestId = generateGuid()
    const callbackUrl = browser.runtime.getURL(`callback.html?request_id=${requestId}`)
    const successUrl = browser.runtime.getURL(`callback.html?request_id=${requestId}&success=true`)
    const failureUrl = browser.runtime.getURL(`callback.html?request_id=${requestId}&success=false`)

    const newUrl = new URL(this._walletBaseUrl + LOGIN_WALLET_URL_SUFFIX)
    newUrl.searchParams.set('success_url', successUrl)
    newUrl.searchParams.set('failure_url', failureUrl)
    newUrl.searchParams.set('referrer', 'mutable-web')

    if (contractId) {
      /* Throws exception if contract account does not exist */
      const contractAccount = await this._near.account(contractId)
      await contractAccount.state()

      newUrl.searchParams.set('contract_id', contractId)
      const accessKey = KeyPair.fromRandom('ed25519')
      newUrl.searchParams.set('public_key', accessKey.getPublicKey().toString())
      await this._keyStore.setKey(
        this._networkId,
        PENDING_ACCESS_KEY_PREFIX + accessKey.getPublicKey(),
        accessKey
      )
    }

    if (methodNames) {
      methodNames.forEach((methodName) => {
        newUrl.searchParams.append('methodNames', methodName)
      })
    }

    const tab = await browser.tabs.create({ url: newUrl.toString() })

    if (!tab?.id || !tab?.windowId) {
      throw new Error('Cannot create tab')
    }

    let callbackTab: browser.Tabs.Tab | null = null as browser.Tabs.Tab | null
    const waitTabPromise = waitTab(callbackUrl).then((x) => (callbackTab = x))
    const closingTabPromise = waitClosingTab(tab.id, tab.windowId)

    await Promise.race([waitTabPromise, closingTabPromise])

    await browser.tabs.update(currentTabId, { active: true })

    if (!callbackTab?.id || !callbackTab?.url) {
      throw new Error('Wallet connection request rejected.')
    }

    await browser.tabs.remove(callbackTab.id)

    const urlObject = new URL(callbackTab.url)
    const success = urlObject.searchParams.get('success') === 'true'

    if (!success) throw new Error('Wallet connection request rejected')

    const accountId = urlObject.searchParams.get('account_id') || ''
    const publicKey = urlObject.searchParams.get('public_key') || ''
    const allKeys = (urlObject.searchParams.get('all_keys') || '').split(',')

    // TODO: Handle situation when access key is not added
    if (!accountId) throw new Error('No account_id params in callback URL')

    if (expectedAccountId !== '' && contractId && expectedAccountId !== accountId) {
      console.log(`Account ${expectedAccountId} was expected, but ${accountId} is connected`)
      return false
    }

    await this.completeSignIn(accountId, publicKey, allKeys) // ToDo: need to wait promise?
    return true
  }

  async requestSignTransactions({
    transactions,
    meta,
    callbackUrl,
  }: RequestSignTransactionsOptions): Promise<void> {
    const [currentTab] = await browser.tabs.query({ active: true, lastFocusedWindow: true })
    if (!currentTab?.url) {
      throw new Error('No active tab')
    }

    const currentUrl = new URL(currentTab.url)
    const newUrl = new URL('sign', this._walletBaseUrl)

    newUrl.searchParams.set(
      'transactions',
      transactions
        .map((transaction) => serialize(NearApiJs.transactions.SCHEMA, transaction))
        .map((serialized) => Buffer.from(serialized).toString('base64'))
        .join(',')
    )
    newUrl.searchParams.set('callbackUrl', callbackUrl || currentUrl.href)
    newUrl.searchParams.set('referrer', 'mutable-web')

    if (meta) newUrl.searchParams.set('meta', meta)

    const signingInTab = await browser.tabs.create({ url: newUrl.toString() })

    if (!signingInTab?.id || !signingInTab?.windowId) {
      throw new Error('Cannot create tab')
    }

    await waitClosingTab(signingInTab.id, signingInTab.windowId)
  }

  async completeSignIn(accountId: string, publicKey: string, allKeys: string[]) {
    if (accountId) {
      this._authData = {
        accountId,
        allKeys,
      }

      await browser.storage.local.set({ [this._authDataKey]: JSON.stringify(this._authData) })

      // It fixes the error "Cannot find matching key for transaction sent to <account_id>"
      if (this._connectedAccount) {
        Object.defineProperty(this._connectedAccount, 'accountId', {
          value: accountId,
          writable: true,
        })
      }

      if (publicKey) {
        await this._moveKeyFromTempToPermanent(accountId, publicKey)
      }
    }
  }

  async _moveKeyFromTempToPermanent(accountId: string, publicKey: string) {
    const keyPair = await this._keyStore.getKey(
      this._networkId,
      PENDING_ACCESS_KEY_PREFIX + publicKey
    )
    await this._keyStore.setKey(this._networkId, accountId, keyPair)
    await this._keyStore.removeKey(this._networkId, PENDING_ACCESS_KEY_PREFIX + publicKey)
  }

  signOut() {
    this._authData = {}
    browser.storage.local.remove(this._authDataKey)
  }

  account() {
    if (!this._connectedAccount) {
      if (!this._authData.accountId) {
        return null
      }

      this._connectedAccount = new CustomConnectedWalletAccount(
        this as any, // ToDo: _completeSignInWithAccessKey is not implemented
        this._near.connection,
        this._authData.accountId
      )
    }
    return this._connectedAccount
  }
}
