import React, { FC } from 'react'
import { GraphCanvas } from 'reagraph'
import { useQuery } from '@tanstack/react-query'
import { getGraph } from './api'

export const Graph: FC = () => {
  const { data } = useQuery({
    queryFn: getGraph,
    queryKey: ['graph'],
  })

  if (!data) {
    return null
  }

  return <GraphCanvas nodes={data.nodes} edges={data.edges} />
}
