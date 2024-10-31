import React, { useEffect } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CollectedData } from './pages/collected-data'
import { Default } from './pages/default'
import { NoParsers } from './pages/no-parsers'
import ContentScript from './content-script'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Layout } from './components/layout'

export const Router: React.FC = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { unsubscribe } = ContentScript.onActiveTabChange(() => {
      queryClient.clear()
    })

    return unsubscribe
  }, [])

  const { data: isAlive } = useQuery({
    queryKey: ['ping'],
    queryFn: ContentScript.ping,
    refetchInterval: 1000,
  })

  if (!isAlive) {
    return <Layout>No connection to the context page. Please reload the webpage.</Layout>
  }

  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" Component={Default} />
        <Route path="collected-data" Component={CollectedData} />
        <Route path="no-parsers" Component={NoParsers} />
      </Routes>
    </MemoryRouter>
  )
}
