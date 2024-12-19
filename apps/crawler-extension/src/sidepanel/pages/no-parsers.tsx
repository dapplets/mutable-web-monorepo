import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Layout as AntdLayout, Button, Flex, Space, Typography } from 'antd'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../../common/background'
import CodeEditor from '../components/CodeEditor'
import CodeIcon from '../components/CodeIcon'
import ContentScript from '../content-script'

export const NoParsers: FC = () => {
  const [isCodeEditorOpened, setIsCodeEditorOpened] = useState(false)
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

  const { mutate: saveLocalParserConfig, isPending: isLocalParserSaving } = useMutation({
    mutationFn: ContentScript.saveLocalParserConfig,
  })

  const handleCreateAdapterClick = async () => {
    if (!(await Background.getChatGptApiKey())) {
      return await ContentScript.openSettingsPage()
    }

    mutate()
  }

  return (
    <AntdLayout style={{ padding: 16 }}>
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        <Flex style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: '0' }}>
            No parsers
          </Typography.Title>
          <Button
            type="link"
            icon={<CodeIcon />}
            iconPosition="start"
            style={{ padding: 0 }}
            onClick={() => setIsCodeEditorOpened((val) => !val)}
          >
            {isCodeEditorOpened ? 'Hide parser' : 'Add scheme'}
          </Button>
        </Flex>

        {isCodeEditorOpened ? (
          <CodeEditor
            parserConfig={''}
            saveParserConfig={saveLocalParserConfig}
            isLocalParserSaving={isLocalParserSaving}
          />
        ) : null}
      </Space>
      <Flex
        style={{ flex: 1, paddingBottom: 80 }}
        vertical
        justify="center"
        align="center"
        gap="middle"
      >
        <Typography.Title level={4}>There is no parser for this website</Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }}>
          It seems like this site doesn't have a parser yet. Would you like to create one now? Our
          AI-tool simplifies the process of generating custom parsers for parsing content from new
          websites. Click the button below to get started.
        </Typography.Text>
        <Button type="primary" onClick={handleCreateAdapterClick} loading={isPending}>
          Create Parser
        </Button>
      </Flex>
    </AntdLayout>
  )
}
