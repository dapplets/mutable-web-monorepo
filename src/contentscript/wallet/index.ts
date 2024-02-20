import type { Action, SignInParams } from '@near-wallet-selector/core'
import {
  BridgeWallet,
  WalletBehaviourFactory,
  WalletModuleFactory,
} from '@near-wallet-selector/core'
import { initBGFunctions } from 'chrome-extension-message-wrapper'
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
  networkId: string
  nodeUrl: string
  walletUrl: string
  helperUrl: string
  explorerUrl: string
}

export class WalletImpl {
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
}

const MyNearWallet: WalletBehaviourFactory<BridgeWallet> = async () => {
  return new WalletImpl()
}

export function setupWallet(): WalletModuleFactory<BridgeWallet> {
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
        return MyNearWallet({ ...options })
      },
    }
  }
}
