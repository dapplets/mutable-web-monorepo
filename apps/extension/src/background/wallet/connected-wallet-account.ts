import { FinalExecutionOutcome } from '@near-wallet-selector/core'
import BN from 'bn.js'
import { ConnectedWalletAccount } from 'near-api-js'
import { SignAndSendTransactionOptions } from 'near-api-js/lib/account'
import { TypedError } from 'near-api-js/lib/providers'
import { Action, createTransaction } from 'near-api-js/lib/transaction'
import { PublicKey, serialize } from 'near-api-js/lib/utils'
import browser from 'webextension-polyfill'
import { generateGuid, waitTab } from '../helpers'

export class CustomConnectedWalletAccount extends ConnectedWalletAccount {
  async signAndSendTransaction({
    receiverId,
    actions,
  }: SignAndSendTransactionOptions): Promise<FinalExecutionOutcome> {
    const [txStatus] = await this.signAndSendTransactions({
      transactions: [{ receiverId, actions }],
    })
    return txStatus
  }

  async signAndSendTransactions(options: {
    transactions: { receiverId: string; actions: Action[] }[]
  }): Promise<FinalExecutionOutcome[]> {
    const block = await this.connection.provider.block({ finality: 'final' })
    const blockHash = serialize.base_decode(block.header.hash)

    const transactions = await Promise.all(
      options.transactions.map(async (tx) => {
        const accessKey = await this._getAccessKeyForTransaction(tx.receiverId, tx.actions)
        const publicKey = PublicKey.from(accessKey.public_key)
        // TODO: Cache & listen for nonce updates for given access key
        const nonce = accessKey.access_key.nonce.add(new BN(1))

        return createTransaction(
          this.accountId,
          publicKey,
          tx.receiverId,
          nonce,
          tx.actions,
          blockHash
        )
      })
    )

    const requestId = generateGuid()
    const callbackUrl = browser.runtime.getURL(`callback.html?request_id=${requestId}`)

    // ToDo: replace currentWindow with lastFocusedWindow
    const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true })

    let callbackTab: browser.Tabs.Tab | null = null as browser.Tabs.Tab | null
    const waitTabPromise = waitTab(callbackUrl).then((x) => (callbackTab = x))
    const requestPromise = this.walletConnection.requestSignTransactions({
      transactions,
      // meta: walletMeta,
      callbackUrl,
    })

    await Promise.race([waitTabPromise, requestPromise])

    if (!callbackTab?.id || !callbackTab?.url) {
      throw new Error(`User rejected the transaction.`)
    }

    await browser.tabs.update(currentTab.id, { active: true })
    await browser.tabs.remove(callbackTab.id)

    const callbackTabUrlObject = new URL(callbackTab.url)
    const transactionHashesJoined = callbackTabUrlObject.searchParams.get('transactionHashes')
    const errorCode = callbackTabUrlObject.searchParams.get('errorCode')

    if (errorCode || !transactionHashesJoined) {
      throw new Error(`User rejected the transaction.`)
    }

    const transactionHashes = transactionHashesJoined.split(',')

    return Promise.all(
      transactionHashes.map((txHash) => {
        return this.walletConnection._near.connection.provider.txStatus(
          serialize.base_decode(txHash),
          this.accountId
        )
      })
    )

    // TODO: Aggregate multiple transaction request with "debounce".
    // TODO: Introduce TrasactionQueue which also can be used to watch for status?
  }

  private async _getAccessKeyForTransaction(receiverId: string, actions: Action[]) {
    if (!this.accountId) throw new Error('this.accountId is undefined')

    const localKey = await this.connection.signer.getPublicKey(
      this.accountId,
      this.connection.networkId
    )
    let accessKey = await this.accessKeyForTransaction(receiverId, actions, localKey)
    if (!accessKey) {
      throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`)
    }

    if (localKey && localKey.toString() === accessKey.public_key) {
      try {
        return await super.signAndSendTransaction({ receiverId, actions })
      } catch (e: unknown) {
        if (e instanceof TypedError && e.type === 'NotEnoughAllowance') {
          accessKey = await this.accessKeyForTransaction(receiverId, actions)
        } else {
          throw e
        }
      }
    }

    return accessKey
  }
}
