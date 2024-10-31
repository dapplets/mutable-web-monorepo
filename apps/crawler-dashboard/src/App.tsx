import React from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Graph } from './graph'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Graph />
    </QueryClientProvider>
  )
}

export default App
