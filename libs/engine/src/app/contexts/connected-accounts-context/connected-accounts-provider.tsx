import React, { FC, ReactNode, useState } from 'react'
import {
  CARequest,
  ConnectedAccountsContext,
  ConnectedAccountsContextState,
  ISocialNetworkConnectionCondition,
} from './connected-accounts-context'
import { useGetCANet } from './use-get-ca-net'
import { useGetCAPairs } from './use-get-ca-pairs'

type Props = {
  children?: ReactNode
}

const socialNetworkConnectionCondition = (props: ISocialNetworkConnectionCondition) => {
  const { socNet_id, near_id, url, fullname } = props
  return url.includes(socNet_id) && fullname.includes(near_id)
}

const ConnectedAccountsProvider: FC<Props> = ({ children }) => {
  const [requests, setRequests] = useState<CARequest[]>([])
  const { connectedAccountsNet, updateConnectedAccountsNet } = useGetCANet()
  const { connectedAccountsPairs, updateConnectedAccountsPairs } = useGetCAPairs()

  const state: ConnectedAccountsContextState = {
    pairs: connectedAccountsPairs,
    connectedAccountsNet,
    updateConnectedAccountsNet,
    updateConnectedAccountsPairs,
    requests,
    setRequests,
    socialNetworkConnectionCondition,
  }

  return (
    <ConnectedAccountsContext.Provider value={state}>
      <>{children}</>
    </ConnectedAccountsContext.Provider>
  )
}

export { ConnectedAccountsProvider }
