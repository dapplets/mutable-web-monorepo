import React, { useEffect, useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Graph } from './graph'
import { Wallet, NearContext } from './near'

const wallet = new Wallet({ networkId: 'mainnet', createAccessKeyFor: 'app.crwl.near' })

const queryClient = new QueryClient()

function App() {
  const [signedAccountId, setSignedAccountId] = useState('')

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <QueryClientProvider client={queryClient}>
        <Graph />
      </QueryClientProvider>
    </NearContext.Provider>
  )
}

export default App
