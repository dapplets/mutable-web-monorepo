import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

export const JobsProvider = ({ children }: { children: React.ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export const useJobs = (url: string, key: string) => {
  const { isPending, error, data } = useQuery({
    queryKey: [key],
    queryFn: () => fetch(url).then((res) => res.json()),
    refetchInterval: 5000,
  })

  return { data, isPending, error }
}
