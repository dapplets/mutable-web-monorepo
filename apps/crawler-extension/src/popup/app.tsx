import React from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Popup } from './popup'

const queryClient = new QueryClient()

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Popup />
    </QueryClientProvider>
  )
}
