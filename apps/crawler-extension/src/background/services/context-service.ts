import browser from 'webextension-polyfill'
import { getStorageServerUrl } from './settings-service'
import { saveReceiptToLocalStorage, SignedReceipt } from './economy-service'
import { near_getAccounts } from './wallet-service'
import { BN } from 'bn.js'

async function unsafe_addContextCount(value: number): Promise<void> {
  const { contextCount } = (await browser.storage.local.get('contextCount')) as {
    contextCount: number | null
  }
  await browser.storage.local.set({
    contextCount: contextCount && typeof contextCount === 'number' ? contextCount + value : value,
  })
}

async function unsafe_addPotentialAmount(amount: string): Promise<void> {
  const { potentialAmount } = (await browser.storage.local.get('potentialAmount')) as {
    potentialAmount: string | null
  }

  const bn = potentialAmount ? new BN(potentialAmount) : new BN(0)

  await browser.storage.local.set({ potentialAmount: bn.add(new BN(amount)).toString() })
}

async function unsafe_storeContext(context: any) {
  const [account] = await near_getAccounts()

  // ToDo: collect data to the localstorage
  if (!account) return

  const storageServerUrl = await getStorageServerUrl()

  // ToDo: use new URL
  // ToDo: extract to the separate service
  const response = await fetch(storageServerUrl + '/context', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ context, receiverId: account.accountId }),
  })

  const signedReceipts: SignedReceipt[] = await response.json()

  await Promise.all(signedReceipts.map((x: any) => saveReceiptToLocalStorage(x)))

  const totalAmount = signedReceipts
    .reduce((acc, x) => acc.add(new BN(x.receipt.amount)), new BN(0))
    .toString()

  await unsafe_addContextCount(signedReceipts.length)
  await unsafe_addPotentialAmount(totalAmount)
}

let promise: Promise<void> = Promise.resolve()

export function storeContext(context: any): Promise<void> {
  promise = promise.then(() => unsafe_storeContext(context))
  return promise
}

export async function getContextCount(): Promise<number> {
  const { contextCount } = (await browser.storage.local.get('contextCount')) as {
    contextCount: number | null
  }

  return contextCount ?? 0
}

export async function getPotentialAmount(): Promise<string> {
  const { potentialAmount } = (await browser.storage.local.get('potentialAmount')) as {
    potentialAmount: string | null
  }

  return potentialAmount ?? '0'
}
