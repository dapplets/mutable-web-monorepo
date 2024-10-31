import browser from 'webextension-polyfill'
import { SignInParams } from '@near-wallet-selector/core'
import { networkConfigs } from '../../common/networks'
import { WalletImpl } from '../wallet'
import { getCurrentNetwork } from './settings-service'
import { updateMenuForConnectedState, updateMenuForDisconnectedState } from './menu-service'

const networkConfigPromise = getCurrentNetwork().then((networkId) => networkConfigs[networkId])

// NEAR wallet

const near = new WalletImpl(networkConfigPromise)

export const connectWallet = async (): Promise<void> => {
  const { socialDbContract } = await networkConfigPromise

  const params: Partial<SignInParams> = {
    // ToDo: Another contract will be rejected by near-social-vm. It will sign out the user
    contractId: socialDbContract,
    methodNames: [],
  }
  const accounts = await near.signIn(params)

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
      if (!tab.id) return
      browser.tabs.sendMessage(tab.id, {
        type: 'SIGNED_IN',
        params: {
          ...params,
          accounts,
        },
      })
    })
  )

  // ToDo: circular dependency
  updateMenuForConnectedState(accounts[0].accountId)
}

export const disconnectWallet = async (): Promise<void> => {
  await near.signOut()

  // send events to all tabs
  browser.tabs.query({}).then((tabs) =>
    tabs.map((tab) => {
      if (!tab.id) return
      browser.tabs.sendMessage(tab.id, { type: 'SIGNED_OUT' })
    })
  )

  // ToDo: circular dependency
  updateMenuForDisconnectedState()
}

export const near_signIn = near.signIn.bind(near)
export const near_signOut = near.signOut.bind(near)
export const near_getAccounts = near.getAccounts.bind(near)
export const near_signAndSendTransaction = near.signAndSendTransaction.bind(near)
export const near_signAndSendTransactions = near.signAndSendTransactions.bind(near)
export const getWalletConnection = near.getWalletConnection.bind(near)
