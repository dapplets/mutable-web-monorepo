import React, { FC, ReactNode, useState } from 'react'
import {
  CARequest,
  ConnectedAccountsContext,
  ConnectedAccountsContextState,
} from './connected-accounts-context'

type Props = {
  children?: ReactNode
}

const ConnectedAccountsProvider: FC<Props> = ({ children }) => {
  const [requests, setRequests] = useState<CARequest[]>([])

  const state: ConnectedAccountsContextState = {
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
