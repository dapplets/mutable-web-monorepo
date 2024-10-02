import { WalletSelector } from '@near-wallet-selector/core'
import * as nearAPI from 'near-api-js'
import { QueryResponseKind } from 'near-api-js/lib/providers/provider'
import { KeyStorage } from '../social-db/key-storage'
import { LocalDbService } from '../local-db/local-db.service'
import Big from 'big.js'
import { NearConfig } from '../../config'
import { TypedError } from 'near-api-js/lib/providers'
import BN from 'bn.js'
import { Cacheable } from 'caching-decorator'

export const DefaultGas = '30000000000000' // 30 TGas
export const TGas = Big(10).pow(12)

/**
 * NearSigner is a wrapper around near-api-js JsonRpcProvider and WalletSelector
 * that provides a simple interface for calling and viewing contract methods.
 *
 * Methods view and call are based on near-social-vm
 * Repo: https://github.com/dapplets/near-social-vm/blob/2ba7b77ada4c8e898cc5599f7000b4e0f30991a4/src/lib/data/near.js
 */
export class NearSigner {
  readonly provider: nearAPI.providers.JsonRpcProvider

  constructor(
    private _selector: WalletSelector,
    private _localDb: LocalDbService,
    public nearConfig: NearConfig
  ) {
    this.provider = new nearAPI.providers.JsonRpcProvider({
      url: nearConfig.nodeUrl,
    })
  }

  async getAccountId(): Promise<string | null> {
    const wallet = await (await this._selector).wallet()
    const accounts = await wallet.getAccounts()
    return accounts[0]?.accountId ?? null
  }

  @Cacheable({ ttl: 1000 }) // ~ block time
  async view(contractName: string, methodName: string, args: any): Promise<any> {
    args = args || {}
    const result = (await this.provider.query({
      request_type: 'call_function',
      account_id: contractName,
      method_name: methodName,
      args_base64: btoa(JSON.stringify(args)),
      block_id: undefined,
      finality: 'final',
    })) as QueryResponseKind & { result: number[] }

    return (
      result.result &&
      result.result.length > 0 &&
      JSON.parse(new TextDecoder().decode(new Uint8Array(result.result)))
    )
  }

  async call(contractName: string, methodName: string, args: any, gas?: string, deposit?: string) {
    if (contractName === this.nearConfig.contractName) {
      const account = await this._createConnectionForContract(contractName)

      // No session key for this contract
      if (!account) {
        return this._signInAndSetCallMethod(contractName, methodName, args, gas, deposit)
      }

      // tx with deposit should be send via wallet
      if (deposit && deposit !== '0') {
        return this._sendTxViaWallet(contractName, methodName, args, gas, deposit)
      }

      try {
        return await account.functionCall({
          contractId: contractName,
          methodName,
          args,
          gas: gas ? new BN(gas) : undefined,
        })
      } catch (e) {
        if (e instanceof TypedError && e.type === 'NotEnoughAllowance') {
          return this._signInAndSetCallMethod(contractName, methodName, args, gas, deposit)
        } else {
          console.error(e)
          throw e
        }
      }
    }

    return this._sendTxViaWallet(contractName, methodName, args, gas, deposit)
  }

  private async _sendTxViaWallet(
    contractName: string,
    methodName: string,
    args: any,
    gas?: string,
    deposit?: string
  ) {
    const wallet = await (await this._selector).wallet()

    return await wallet.signAndSendTransaction({
      receiverId: contractName,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName,
            args,
            gas: gas ?? DefaultGas,
            deposit: deposit ?? '0',
          },
        },
      ],
    })
  }

  private _getKeyStoreForContract(contractId: string) {
    return new KeyStorage(this._localDb, `${contractId}:keystore:`)
  }

  private async _createConnectionForContract(contractId: string) {
    const keyStore = this._getKeyStoreForContract(contractId)

    const loggedInAccountId = await this.getAccountId()

    if (!loggedInAccountId) throw new Error('Not logged in')

    const keyForContract = await keyStore.getKey(this.nearConfig.networkId, loggedInAccountId)

    if (!keyForContract) return null

    const near = await nearAPI.connect({
      keyStore,
      networkId: this.nearConfig.networkId,
      nodeUrl: this.provider.connection.url,
      headers: {},
    })

    const account = await near.account(loggedInAccountId)

    // two parameters of this methods are not implemented
    // see more: https://github.com/near/near-api-js/blob/45cfbec891d996915c32f66d8ddcdca540ea3645/packages/accounts/src/account.ts#L231
    const accessKey = await account.findAccessKey(contractId, [])

    // key doesn't exist
    if (!accessKey) {
      return null
    }

    return account
  }

  private async _signInAndSetCallMethod(
    contractName: string,
    methodName: string,
    args: any,
    gas?: string,
    deposit?: string
  ) {
    const keyPair = nearAPI.utils.KeyPair.fromRandom('ed25519')
    const allowance = nearAPI.utils.format.parseNearAmount('0.25')
    // @ts-ignore
    const accessKey = nearAPI.transactions.functionCallAccessKey(contractName, [], allowance)

    const publicKey = keyPair.getPublicKey()
    const wallet = await this._selector.wallet()
    const walletAccount = (await wallet.getAccounts())[0]
    const accountId = walletAccount.accountId

    const result = await wallet.signAndSendTransactions({
      transactions: [
        {
          receiverId: accountId,
          actions: [
            {
              type: 'AddKey',
              params: {
                publicKey: publicKey.toString(),
                accessKey: {
                  // ToDo
                  // @ts-ignore
                  permission: accessKey.permission.functionCall,
                },
              },
            },
          ],
          gas: TGas.mul(30),
        },
        {
          receiverId: contractName,
          actions: [
            {
              type: 'FunctionCall',
              params: {
                methodName,
                args,
                gas: gas ?? DefaultGas,
                deposit: deposit ?? '0',
              },
            },
          ],
        },
      ],
    })

    const keyStore = this._getKeyStoreForContract(contractName)
    await keyStore.setKey(this.nearConfig.networkId, accountId, keyPair)

    localStorage.setItem(
      `${contractName}_wallet_auth_key`,
      JSON.stringify({ accountId, allKeys: [walletAccount.publicKey] })
    )
    return result
  }
}
