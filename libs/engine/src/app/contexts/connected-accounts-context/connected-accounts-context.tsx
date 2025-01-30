import { IConnectedAccountsPair } from '@mweb/backend'
import React, { createContext } from 'react'

export enum RequestStatus {
  CLAIMING = 'claiming',
  VERIFICATION = 'verification',
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
  connectedAccountsNet: string[] | null
  updateConnectedAccountsNet: () => Promise<void>
  requests: CARequest[]
  setRequests: React.Dispatch<React.SetStateAction<CARequest[]>>
}

export const contextDefaultValues: ConnectedAccountsContextState = {
  connectedAccountsNet: null,
  updateConnectedAccountsNet: () => new Promise(() => null),
  requests: [],
  setRequests: () => {},
}

export const ConnectedAccountsContext =
  createContext<ConnectedAccountsContextState>(contextDefaultValues)
