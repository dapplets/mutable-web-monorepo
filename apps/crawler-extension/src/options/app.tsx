import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Flex, Form, Input, message, Space } from 'antd'

import Background from '../common/background'
import { crawlerConfig } from '../common/networks'

export const App: React.FC = () => {
  const [form] = Form.useForm()
  const [isApiKeyNotSet, setIsApiKeyNotSet] = useState(false)

  const loadData = useCallback(async () => {
    const [chatGptApiKey, organizationId, projectId, assistantId] = await Promise.all([
      Background.getChatGptApiKey(),
      Background.getOrganizationId(),
      Background.getProjectId(),
      Background.getAssistantId(),
    ])

    setIsApiKeyNotSet(!chatGptApiKey)

    form.setFieldsValue({
      chatGptApiKey,
      organizationId,
      projectId,
      assistantId,
    })
  }, [form])

  useEffect(() => {
    loadData()
  }, [form])

  const onFinish = async () => {
    await Promise.all([
      Background.setChatGptApiKey(form.getFieldValue('chatGptApiKey') ?? null),
      Background.setOrganizationId(form.getFieldValue('organizationId') ?? null),
      Background.setProjectId(form.getFieldValue('projectId') ?? null),
      Background.setAssistantId(form.getFieldValue('assistantId') ?? null),
    ])
    await loadData()
  }

  return (
    <div>
      <h1>Options</h1>
      <Flex gap="middle" vertical>
        {isApiKeyNotSet ? (
          <Alert
            message="Enter your OpenAI API key"
            description="This allows you to parse websites without an existing adapter. Get your API key at: https://platform.openai.com/api-keys"
            type="info"
            showIcon
          />
        ) : null}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="chatGptApiKey" label="OpenAI API Key">
            <Input placeholder="sk-proj-YOURAPIKEY" />
          </Form.Item>
          <Form.Item name="organizationId" label="Organization ID">
            <Input placeholder={crawlerConfig.organizationId} />
          </Form.Item>
          <Form.Item name="projectId" label="Project ID">
            <Input placeholder={crawlerConfig.projectId} />
          </Form.Item>
          <Form.Item name="assistantId" label="Assistant ID">
            <Input placeholder={crawlerConfig.assistantId} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Flex>
    </div>
  )
}
