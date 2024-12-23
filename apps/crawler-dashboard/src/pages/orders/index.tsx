import { Button, Card, Spin, Typography, Row, Col, Empty, Result, theme } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../../api'

const { Title, Text } = Typography

export const OrdersPage: FC = () => {
  const navigate = useNavigate()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })

  return (
    <div
      style={{
        background: colorBgContainer,
        minHeight: 280,
        padding: '24px',
        borderRadius: borderRadiusLG,
        margin: '16px 0',
      }}
    >
      {/* Page Title */}
      <Title level={3} style={{ marginBottom: '24px' }}>
        Orders Management
      </Title>

      {/* Create Order Button */}
      <Button
        type="primary"
        onClick={() => navigate('/orders/create')}
        style={{ marginBottom: '24px' }}
      >
        Create Order
      </Button>

      {/* Orders Content */}
      <div>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        )}

        {error && <Result status="error" title="Failed to Fetch Orders" subTitle={error.message} />}

        {!isLoading && !error && orders?.length === 0 && (
          <Empty description="No orders available." style={{ padding: '50px 0' }} />
        )}

        {!isLoading && orders && orders.length > 0 && (
          <Row gutter={[24, 24]}>
            {orders.map((order) => (
              <Col key={order.id} xs={24} sm={24} md={12} lg={8}>
                <Card
                  title={`Order ID: ${order.id}`}
                  hoverable
                  style={{ borderRadius: borderRadiusLG }}
                >
                  {order.jobs.map((job, jobIdx) => (
                    <div key={jobIdx} style={{ marginBottom: '16px' }}>
                      <Text strong>Job {jobIdx + 1} Schedule:</Text>
                      <p>{job.schedule}</p>

                      <Text strong>Steps:</Text>
                      <ul>
                        {job.steps.map((step, stepIdx) => (
                          <li key={stepIdx}>
                            <Text>
                              <strong>Parser ID:</strong> {step.parserId}, <strong>URL:</strong>{' '}
                              {step.url}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}
