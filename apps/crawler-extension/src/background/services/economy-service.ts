import browser from 'webextension-polyfill'
import { Contract } from 'near-api-js'
import { getWalletConnection, near_getAccounts } from './wallet-service'
import { BN } from 'bn.js'

export type SignedReceipt = {
  public_key: string
  receipt: {
    data_hash: any
    amount: string
    receiver_id: string
  }
  signature: string
}

export const saveReceiptToLocalStorage = async (signedReceipt: SignedReceipt): Promise<void> => {
  const internalId = `${signedReceipt.receipt.receiver_id}/receipt/${signedReceipt.signature}`
  await browser.storage.local.set({ [internalId]: signedReceipt })
}

export const getAllLocalReceipts = async (): Promise<SignedReceipt[]> => {
  const data = await browser.storage.local.get(null)

  const receipts = Object.keys(data)
    .filter((key) => key.includes('/receipt/'))
    .map((key) => data[key])

  return receipts as SignedReceipt[]
}

export const claimRewards = async (signed_receipts: SignedReceipt[]): Promise<void> => {
  // claim_reward
  const connection = await getWalletConnection()
  const account = connection.account()
  if (!account) throw new Error('Not logged in')

  const contract = new Contract(account, 'app.crwl.near', {
    changeMethods: ['claim_rewards'],
    viewMethods: [],
  })

  // @ts-ignore
  await contract.claim_rewards({ signed_receipts })
}

export const checkReceipts = async (signed_receipts: SignedReceipt[]): Promise<boolean[]> => {
  const connection = await getWalletConnection()
  const account = connection.account()
  if (!account) throw new Error('Not logged in')

  const contract = new Contract(account, 'app.crwl.near', {
    changeMethods: [],
    viewMethods: ['check_receipts'],
  })

  // Max ~800 receipts in one call
  // @ts-ignore
  return await contract.check_receipts({ signed_receipts })
}

export const getClaimableRewards = async () => {
  const receipts = await getAllLocalReceipts()
  const chunks = Object.values(Object.groupBy(receipts, (_, i) => Math.floor(i / 500))).filter(
    (x) => !!x
  )

  const claimableChunks = await Promise.all(
    chunks.map((chunk) => checkReceipts(chunk).then((res) => chunk?.filter((_, i) => res[i])))
  )

  const claimableReceipts = claimableChunks.flat()

  return claimableReceipts
}

export const getAvailableToClaimAmount = async () => {
  const claimable = await getClaimableRewards()
  return claimable.reduce((acc, x) => acc.add(new BN(x.receipt.amount)), new BN(0)).toString()
}

export const claimTokens = async () => {
  const claimable = await getClaimableRewards()
  await claimRewards(claimable)
}
