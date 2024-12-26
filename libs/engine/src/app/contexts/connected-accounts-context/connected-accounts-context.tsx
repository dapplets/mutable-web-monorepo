import React, { createContext } from 'react'
import { ConnectedAccountService, IConnectedAccountsPair } from '@mweb/backend'

export interface ConnectedAccountsContextState
  extends Omit<
    ConnectedAccountService,
    'contractName' | 'networkId' | 'nearSigner' | 'changeStatus' | 'getPairs' | 'getNet'
  > {
  pairs: IConnectedAccountsPair[] | null
  connectedAccountsNet: string[] | null
  setConnectedAccountsPairs: React.Dispatch<React.SetStateAction<IConnectedAccountsPair[] | null>>
  setConnectedAccountsNet: React.Dispatch<React.SetStateAction<string[] | null>>
}

export const contextDefaultValues: ConnectedAccountsContextState = {
  pairs: null,
  connectedAccountsNet: null,
  setConnectedAccountsNet: () => new Promise(() => null),
  setConnectedAccountsPairs: () => new Promise(() => null),
  getConnectedAccounts: () => new Promise(() => null),
  getMinStakeAmount: () => new Promise(() => null),
  getPendingRequests: () => new Promise(() => null),
  getVerificationRequest: () => new Promise(() => null),
  getStatus: () => new Promise(() => null),
  areConnected: () => new Promise(() => null),
  getMainAccount: () => new Promise(() => null),
  getRequestStatus: () => new Promise(() => null),
  requestVerification: () => new Promise(() => null),
}

export const ConnectedAccountsContext =
  createContext<ConnectedAccountsContextState>(contextDefaultValues)
