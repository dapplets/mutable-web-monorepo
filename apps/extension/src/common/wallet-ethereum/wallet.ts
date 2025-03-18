import { EventEmitter as NEventEmitter } from 'events'
import Background from '../background'
import { ethers } from 'ethers'
import { TransactionRequest } from '@ethersproject/providers'

export interface WalletParams {
  eventEmitter: NEventEmitter
}

export class WalletImpl {
  //   private _externalEmitter: NEventEmitter
  //   private _internalEmitter: EventEmitterService<WalletEvents>

  // constructor(options: WalletParams & WalletBehaviourOptions<BridgeWallet>) {
  //   this._externalEmitter = options.eventEmitter
  //   this._internalEmitter = options.emitter
  // this._initializeState() // ToDo: it's async method
  // }

  signIn = async () => {
    return Background.connectEthWallet()
  }

  signOut = async () => {
    throw new Error(`Method not supported`)
  }

  getAddress = async () => {
    return (await Background.getEthAddresses())?.[0] || ''
  }

  verifyOwner = async () => {
    throw new Error(`Method not supported`)
  }

  signMessage = async (message: string | ethers.Bytes) => {
    return Background.signEthMessage(message)
  }

  sendTransaction = async (transaction: TransactionRequest) => {
    return Background.sendEthTransaction(transaction)
  }

  sendCustomRequest = async (method: string, params: any[]) => {
    return Background.sendEthCustomRequest(method, params)
  }

  buildImportAccountsUrl = (): string => {
    throw new Error(`Method not supported`)
  }

  // async _initializeState() {
  //   try {
  //     const accounts = await this.getAccounts()

  //     if (accounts.length > 0) {
  //       this._internalEmitter.emit('signedIn', {
  //         accounts,
  //         contractId: 'social.near', // ToDo: hardcoded contract id
  //         methodNames: [],
  //       })
  //     } else {
  //       this._internalEmitter.emit('signedOut', null)
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   } finally {
  //     this._externalEmitter.on('signedIn', (event) => {
  //       this._internalEmitter.emit('signedIn', event)
  //     })
  //     this._externalEmitter.on('signedOut', () => {
  //       this._internalEmitter.emit('signedOut', null)
  //     })
  //   }
  // }
}

// const MyNearWallet: WalletBehaviourFactory<BridgeWallet> = async (options) => {
//   return new WalletImpl(options as WalletParams & WalletBehaviourOptions<BridgeWallet>)
// }

// export function setupWallet(params: WalletParams): WalletModuleFactory<BridgeWallet> {
//   return async () => {
//     return {
//       id: 'mutable-web-extension',
//       type: 'bridge',
//       metadata: {
//         name: 'mutable-web-extension',
//         description: 'mutable-web-extension',
//         available: true,
//         iconUrl: '',
//         deprecated: false,
//         walletUrl: '',
//       },
//       init: (options) => {
//         return MyNearWallet({ ...options, ...params })
//       },
//     }
//   }
// }
