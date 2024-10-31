import { useQuery } from '@tanstack/react-query'
import React, { FC } from 'react'
import { Navigate } from 'react-router-dom'
import ContentScript from '../content-script'
import { Layout } from '../components/layout'

export const Default: FC = () => {
  const { data: parsers, isLoading } = useQuery({
    queryKey: ['getSuitableParserConfigs'],
    queryFn: ContentScript.getSuitableParserConfigs,
  })

  if (isLoading) {
    return <Layout>Loading parsers...</Layout>
  } else if (!parsers?.length) {
    return <Navigate to="/no-parsers" />
  } else {
    return <Navigate to="/collected-data" />
  }
}
