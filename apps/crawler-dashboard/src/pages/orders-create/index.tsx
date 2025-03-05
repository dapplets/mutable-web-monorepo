import { Button, Form, Input, Select, Spin, Table, theme } from 'antd'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, mweb } from '../../api'

export const CreateOrderPage: FC = () => {
  const [form] = Form.useForm()
  const [steps, setSteps] = React.useState<any[]>([])
  const navigate = useNavigate()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const createOrderMutation = useMutation({ mutationFn: api.order.create })

  const { data: parserConfigs, isLoading: areParserConfigsLoading } = useQuery({
    queryKey: ['parserConfigs'],
    queryFn: () => mweb.parserConfigService.getAllParserConfigs(),
  })

  console.log({ parserConfigs })

  const handleAddStep = (values: any) => {
    setSteps((prev) => [...prev, values])
    form.resetFields(['parserId', 'url'])
  }

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (values: any) => {
    const orderData = {
      jobs: [
        {
          schedule: values.schedule,
          steps: steps,
        },
      ],
    }

    try {
      await createOrderMutation.mutateAsync(orderData)
      navigate('/')
    } catch (error) {
      console.error('Failed to submit order:', error)
    }
  }

  const columns = [
    { title: 'Parser ID', dataIndex: 'parserId', key: 'parserId' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, __: any, index: number) => (
        <Button type="link" onClick={() => handleRemoveStep(index)}>
          Remove
        </Button>
      ),
    },
  ]

  return (
    <div
      style={{
        background: colorBgContainer,
        minHeight: 280,
        padding: '12px 24px',
        borderRadius: borderRadiusLG,
        margin: '16px 0',
      }}
    >
      <h2>Create Job</h2>
      <Form layout="vertical" onFinish={handleSubmit} form={form}>
        <Form.Item
          name="schedule"
          label="Schedule (Cron Expression)"
          rules={[{ required: true, message: 'Please input the schedule!' }]}
        >
          <Input placeholder="e.g. 0 0 * * *" />
        </Form.Item>

        <h3>Steps</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Form.Item
            name="parserId"
            label="Parser ID"
            rules={[{ message: 'Please input the parser ID!' }]}
            style={{ flex: 1 }}
          >
            <Select
              filterOption={false}
              notFoundContent={areParserConfigsLoading ? <Spin size="small" /> : null}
              options={
                parserConfigs?.map((parserConfig) => ({
                  value: parserConfig.id,
                })) ?? []
              }
            />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[{ message: 'Please input the URL!' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g. http://example.com" />
          </Form.Item>

          <Button
            type="primary"
            onClick={() => {
              form
                .validateFields(['parserId', 'url'])
                .then((values) => handleAddStep(values))
                .catch((errorInfo) => console.error(errorInfo))
            }}
          >
            Add Step
          </Button>
        </div>

        <Table
          dataSource={steps.map((step, index) => ({ ...step, key: index }))}
          columns={columns}
          style={{ marginTop: '20px' }}
          pagination={false}
        />

        <Form.Item style={{ marginTop: '20px' }}>
          <Button type="primary" htmlType="submit">
            Submit Job
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
