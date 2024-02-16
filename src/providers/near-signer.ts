import { WalletSelector } from '@near-wallet-selector/core'
import * as nearAPI from 'near-api-js'
import { QueryResponseKind } from 'near-api-js/lib/providers/provider'

export const DefaultGas = '30000000000000' // 30 TGas

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
    nodeUrl: string
  ) {
    this.provider = new nearAPI.providers.JsonRpcProvider({
      url: nodeUrl,
    })
  }

  async getAccountId(): Promise<string | null> {
    const wallet = await (await this._selector).wallet()
    const accounts = await wallet.getAccounts()
    return accounts[0]?.accountId ?? null
  }

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
    try {
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
    } catch (e) {
      // const msg = e.toString();
      // if (msg.indexOf("does not have enough balance") !== -1) {
      //   return await refreshAllowanceObj.refreshAllowance();
      // }
      throw e
    }
  }
}
