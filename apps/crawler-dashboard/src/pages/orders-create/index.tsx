import { Button, Form, Input, Table, theme } from 'antd'
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '../../api'

export const CreateOrderPage: FC = () => {
  const [form] = Form.useForm()
  const [steps, setSteps] = React.useState<any[]>([])
  const navigate = useNavigate()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const createOrderMutation = useMutation({ mutationFn: api.order.create })

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
      <h2>Create Order</h2>
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
          >
            <Input placeholder="e.g. parser-123" />
          </Form.Item>

          <Form.Item name="url" label="URL" rules={[{ message: 'Please input the URL!' }]}>
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
            Submit Order
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
