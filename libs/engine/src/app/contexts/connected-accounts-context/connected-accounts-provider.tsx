import React, { FC, ReactNode, useState } from 'react'
import {
  CARequest,
  ConnectedAccountsContext,
  ConnectedAccountsContextState,
} from './connected-accounts-context'
import { useGetCANet } from './use-get-ca-net'

type Props = {
  children?: ReactNode
}

const ConnectedAccountsProvider: FC<Props> = ({ children }) => {
  const [requests, setRequests] = useState<CARequest[]>([])
  const { connectedAccountsNet, updateConnectedAccountsNet } = useGetCANet()

  const state: ConnectedAccountsContextState = {
    connectedAccountsNet,
    updateConnectedAccountsNet,
    requests,
    setRequests,
  }

  return (
    <ConnectedAccountsContext.Provider value={state}>
      <>{children}</>
    </ConnectedAccountsContext.Provider>
  )
}

export { ConnectedAccountsProvider }
