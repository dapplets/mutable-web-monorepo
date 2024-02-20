import type {
  Action,
  EventEmitterService,
  SignInParams,
  WalletBehaviourOptions,
  WalletEvents,
} from '@near-wallet-selector/core'
import {
  BridgeWallet,
  WalletBehaviourFactory,
  WalletModuleFactory,
} from '@near-wallet-selector/core'
import { initBGFunctions } from 'chrome-extension-message-wrapper'
import { EventEmitter as NEventEmitter } from 'events'
import browser from 'webextension-polyfill'

export interface BrowserWalletSignInParams extends SignInParams {
  successUrl?: string
  failureUrl?: string
}

export interface SignAndSendTransactionParams {
  signerId?: string
  receiverId?: string
  actions: Array<Action>
}

export interface BrowserWalletSignAndSendTransactionParams extends SignAndSendTransactionParams {
  callbackUrl?: string
}

export interface WalletParams {
  eventEmitter: NEventEmitter
}

export class WalletImpl {
  private _externalEmitter: NEventEmitter
  private _internalEmitter: EventEmitterService<WalletEvents>

  constructor(options: WalletParams & WalletBehaviourOptions<BridgeWallet>) {
    this._externalEmitter = options.eventEmitter
    this._internalEmitter = options.emitter
    this._initializeState() // ToDo: it's async method
  }

  signIn = async () => {
    return initBGFunctions(browser).then((x) => x.near_signIn())
  }

  signOut = async () => {
    return initBGFunctions(browser).then((x) => x.near_signOut())
  }

  getAccounts = async () => {
    return initBGFunctions(browser).then((x) => x.near_getAccounts())
  }

  verifyOwner = async () => {
    throw new Error(`Method not supported`)
  }

  signMessage = async () => {
    throw new Error(`Method not supported`)
  }

  signAndSendTransaction = async (params) => {
    return initBGFunctions(browser).then((x) => x.near_signAndSendTransaction(params))
  }

  signAndSendTransactions = async (params) => {
    return initBGFunctions(browser).then((x) => x.near_signAndSendTransactions(params))
  }

  buildImportAccountsUrl = (): string => {
    throw new Error(`Method not supported`)
  }

  async _initializeState() {
    try {
      const accounts = await this.getAccounts()

      if (accounts.length > 0) {
        this._internalEmitter.emit('signedIn', {
          accounts,
          contractId: 'social.near', // ToDo: hardcoded contract id
          methodNames: [],
        })
      } else {
        this._internalEmitter.emit('signedOut', null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      this._externalEmitter.on('signedIn', (event) => {
        this._internalEmitter.emit('signedIn', event)
      })
      this._externalEmitter.on('signedOut', () => {
        this._internalEmitter.emit('signedOut', null)
      })
    }
  }
}

const MyNearWallet: WalletBehaviourFactory<BridgeWallet> = async (options) => {
  return new WalletImpl(options as WalletParams & WalletBehaviourOptions<BridgeWallet>)
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
        return MyNearWallet({ ...options, ...params })
      },
    }
  }
}
