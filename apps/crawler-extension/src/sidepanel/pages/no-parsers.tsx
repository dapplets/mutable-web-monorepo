import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Flex, Typography } from 'antd'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import ContentScript from '../content-script'

export const NoParsers: FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: ContentScript.generateParserConfig,
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ['getSuitableParserConfigs'] })
        .then(() => navigate('/collected-data'))
    },
  })

  const handleCreateAdapterClick = () => {
    mutate()
  }

  return (
    <Flex style={{ padding: 16 }} vertical justify="center" align="center" gap="middle">
      <Typography.Title level={4}>There is no adapter for this website</Typography.Title>
      <Typography.Text style={{ textAlign: 'center' }}>
        It seems like this site doesn't have an adapter yet. Would you like to create one now? Our
        tool simplifies the process of generating custom adapters for parsing content from new
        websites. Click the button below to get started.
      </Typography.Text>
      <Button type="primary" onClick={handleCreateAdapterClick} loading={isPending}>
        Create Adapter
      </Button>
    </Flex>
  )
}
