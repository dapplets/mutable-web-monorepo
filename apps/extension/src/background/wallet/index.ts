import type { Account, Action, SignInParams, Transaction } from '@near-wallet-selector/core'
import {
  BridgeWallet,
  WalletBehaviourFactory,
  WalletModuleFactory,
} from '@near-wallet-selector/core'
import { createAction } from '@near-wallet-selector/wallet-utils'
import * as nearAPI from 'near-api-js'
import { Near } from 'near-api-js'
import browser from 'webextension-polyfill'
import { WebExtensionKeyStorage } from './key-storage'
import { CustomWalletConnection } from './wallet-connection'

const LOCAL_STORAGE_KEY_SUFFIX = '_wallet_auth_key'

export interface SignAndSendTransactionParams {
  signerId?: string
  receiverId: string
  actions: Array<Action>
}

export interface BrowserWalletSignAndSendTransactionParams extends SignAndSendTransactionParams {
  callbackUrl?: string
}

export interface WalletParams {
  networkId: string
  nodeUrl: string
  walletUrl: string
  helperUrl: string
  explorerUrl: string
}

export class WalletImpl {
  private _statePromise: Promise<{
    wallet: CustomWalletConnection
    keyStore: WebExtensionKeyStorage
  }>

  constructor(private _config: WalletParams) {
    this._statePromise = this._setupWalletState()
  }

  signIn = async ({ contractId, methodNames }: Partial<SignInParams>): Promise<Account[]> => {
    const _state = await this._statePromise
    const existingAccounts = await this.getAccounts()

    if (existingAccounts.length) {
      return existingAccounts
    }

    await _state.wallet.requestSignIn({
      contractId,
      methodNames,
    })

    return this.getAccounts()
  }

  signOut = async (): Promise<void> => {
    const _state = await this._statePromise
    if (_state.wallet.isSignedIn()) {
      _state.wallet.signOut()
    }
  }

  getAccounts = async (): Promise<Account[]> => {
    const _state = await this._statePromise

    const accountId = _state.wallet.getAccountId()
    const account = _state.wallet.account()

    if (!accountId || !account) {
      return []
    }

    const publicKey = await account.connection.signer.getPublicKey(
      account.accountId,
      this._config.networkId
    )
    return [
      {
        accountId,
        publicKey: publicKey ? publicKey.toString() : '',
      },
    ]
  }

  verifyOwner = async () => {
    throw new Error(`Method is not implemented`)
  }

  signMessage = async () => {
    throw new Error(`Method not supported`)
  }

  signAndSendTransaction = async ({
    receiverId,
    actions,
  }: BrowserWalletSignAndSendTransactionParams): Promise<nearAPI.providers.FinalExecutionOutcome> => {
    const _state = await this._statePromise

    const account = _state.wallet.account()

    if (!account) {
      throw new Error('Not logged in')
    }

    return account.signAndSendTransaction({
      receiverId: receiverId,
      actions: actions.map((action) => createAction(action)),
    })
  }

  signAndSendTransactions = async ({
    transactions,
  }: {
    transactions: Transaction[]
  }): Promise<nearAPI.providers.FinalExecutionOutcome[]> => {
    const _state = await this._statePromise

    const account = _state.wallet.account()

    if (!account) {
      throw new Error('Not logged in')
    }

    const finalExecutionOutcomes = await account.signAndSendTransactions({
      transactions: transactions.map((tx) => ({
        receiverId: tx.receiverId,
        actions: tx.actions.map((action) => createAction(action)),
      })),
    })

    return finalExecutionOutcomes
  }

  buildImportAccountsUrl = (): string => {
    return `${this._config.walletUrl}/batch-import`
  }

  private async _setupWalletState() {
    const keyStore = new WebExtensionKeyStorage()

    const near = new Near({
      walletUrl: this._config.walletUrl,
      networkId: this._config.networkId,
      nodeUrl: this._config.nodeUrl,
      helperUrl: this._config.helperUrl,
      headers: {},
      deps: { keyStore },
    })

    const appKeyPrefix = this._config.networkId
    const authDataKey = appKeyPrefix + LOCAL_STORAGE_KEY_SUFFIX
    const authData = JSON.parse(
      (await browser.storage.local.get(authDataKey))[authDataKey] ?? 'null'
    )

    // ToDo: replace this._config.networkId with app_key prefix
    const wallet = new CustomWalletConnection(near, authData, authDataKey)
    // const wallet = new nearAPI.WalletConnection(near, appKeyPrefix)

    return {
      wallet,
      keyStore,
    }
  }
}

const MyNearWallet: WalletBehaviourFactory<BridgeWallet, { params: WalletParams }> = async ({
  params,
}) => {
  return new WalletImpl(params)
}

export function setupWallet(params: WalletParams): WalletModuleFactory<BridgeWallet> {
  return async () => {
    return {
      id: 'background',
      type: 'bridge',
      metadata: {
        name: 'background',
        description: 'background',
        available: true,
        iconUrl: '',
        deprecated: false,
        walletUrl: '',
      },
      init: (options) => {
        return MyNearWallet({ ...options, params })
      },
    }
  }
}
