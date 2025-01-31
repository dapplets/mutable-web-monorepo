import { IConnectedAccountsPair } from '@mweb/backend'
import React, { createContext } from 'react'

export interface ISocialNetworkConnectionCondition {
  socNet_id: string
  near_id: string
  url: string
  fullname: string
}

export enum RequestStatus {
  SIGNING = 'signing',
  VERIFYING = 'verifying',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEFAULT = 'default',
}

export type CARequest = {
  id: number
  type: string
  payload: Set<string>
  status: RequestStatus
  message?: string
}

export interface ConnectedAccountsContextState {
  pairs: IConnectedAccountsPair[] | null
  connectedAccountsNet: string[] | null
  updateConnectedAccountsPairs: () => Promise<void>
  updateConnectedAccountsNet: () => Promise<void>
  requests: CARequest[]
  setRequests: React.Dispatch<React.SetStateAction<CARequest[]>>
  socialNetworkConnectionCondition: (props: ISocialNetworkConnectionCondition) => boolean
}

export const contextDefaultValues: ConnectedAccountsContextState = {
  pairs: null,
  connectedAccountsNet: null,
  updateConnectedAccountsNet: () => new Promise(() => null),
  updateConnectedAccountsPairs: () => new Promise(() => null),
  requests: [],
  setRequests: () => {},
  socialNetworkConnectionCondition: () => false,
}

export const ConnectedAccountsContext =
  createContext<ConnectedAccountsContextState>(contextDefaultValues)
