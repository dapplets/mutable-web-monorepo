import React, { useCallback, useEffect } from 'react'
import { Button, Form, Input, message, Space } from 'antd'

import Background from '../common/background'

export const App: React.FC = () => {
  const [form] = Form.useForm()

  const loadData = useCallback(async () => {
    form.setFieldsValue({
      url: await Background.getDevServerUrl(),
    })
  }, [form])

  useEffect(() => {
    loadData()
  }, [form])

  const onFinish = async () => {
    await Promise.all([Background.setDevServerUrl(form.getFieldValue('url') ?? null)])
    await loadData()
  }

  return (
    <div>
      <h1>Options</h1>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="url"
          label="URL"
          rules={[
            { type: 'url', warningOnly: true },
            { type: 'string', min: 6 },
          ]}
        >
          <Input placeholder="http://localhost:3030" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}
