import { useQuery } from '@tanstack/react-query'
import React, { FC } from 'react'
import { Navigate } from 'react-router-dom'
import ContentScript from '../content-script'
import { Layout } from '../components/layout'
import { Typography } from 'antd'

export const Default: FC = () => {
  const { data: parsers, isLoading } = useQuery({
    queryKey: ['getSuitableParserConfigs'],
    queryFn: ContentScript.getSuitableParserConfigs,
  })

  if (isLoading) {
    return (
      <Layout>
        <Typography.Text style={{ textAlign: 'center' }}>Loading parsers...</Typography.Text>
      </Layout>
    )
  } else if (!parsers?.length) {
    return <Navigate to="/no-parsers" />
  } else {
    return <Navigate to="/collected-data" />
  }
}
