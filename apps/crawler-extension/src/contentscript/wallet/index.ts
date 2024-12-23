import type {
  Action,
  EventEmitterService,
  SignInParams,
  Transaction,
  WalletBehaviourOptions,
  WalletEvents,
} from '@near-wallet-selector/core'
import {
  BridgeWallet,
  WalletBehaviourFactory,
  WalletModuleFactory,
} from '@near-wallet-selector/core'
import { EventEmitter as NEventEmitter } from 'events'
import Background from '../../common/background'

export interface BrowserWalletSignInParams extends SignInParams {
  successUrl?: string
  failureUrl?: string
}

export interface SignAndSendTransactionParams {
  signerId?: string
  receiverId: string
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

  signIn = async (params: Partial<SignInParams>) => {
    return Background.near_signIn(params)
  }

  signOut = async () => {
    return Background.near_signOut()
  }

  getAccounts = async () => {
    return Background.near_getAccounts()
  }

  verifyOwner = async () => {
    throw new Error(`Method not supported`)
  }

  signMessage = async () => {
    throw new Error(`Method not supported`)
  }

  signAndSendTransaction = async (params: BrowserWalletSignAndSendTransactionParams) => {
    return Background.near_signAndSendTransaction(params)
  }

  signAndSendTransactions = async (params: { transactions: Transaction[] }) => {
    return Background.near_signAndSendTransactions(params)
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
      id: 'mutable-web-extension',
      type: 'bridge',
      metadata: {
        name: 'mutable-web-extension',
        description: 'mutable-web-extension',
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
