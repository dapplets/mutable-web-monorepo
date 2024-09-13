import React from 'react'
import { Space, Typography, Card, Tag, Collapse } from 'antd'
import { GenericNotification, NotificationType } from '../types'

const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
    <path
      d="M0 1.50684C0 1.29264 0.0660807 1.11263 0.198242 0.966797C0.334961 0.816406 0.530924 0.741211 0.786133 0.741211C1.04134 0.741211 1.23503 0.816406 1.36719 0.966797C1.50391 1.11263 1.57227 1.29264 1.57227 1.50684C1.57227 1.71647 1.50391 1.89421 1.36719 2.04004C1.23503 2.18587 1.04134 2.25879 0.786133 2.25879C0.530924 2.25879 0.334961 2.18587 0.198242 2.04004C0.0660807 1.89421 0 1.71647 0 1.50684Z"
      fill="#7A818B"
    />
    <path
      d="M3.69141 1.50684C3.69141 1.29264 3.75749 1.11263 3.88965 0.966797C4.02637 0.816406 4.22233 0.741211 4.47754 0.741211C4.73275 0.741211 4.92643 0.816406 5.05859 0.966797C5.19531 1.11263 5.26367 1.29264 5.26367 1.50684C5.26367 1.71647 5.19531 1.89421 5.05859 2.04004C4.92643 2.18587 4.73275 2.25879 4.47754 2.25879C4.22233 2.25879 4.02637 2.18587 3.88965 2.04004C3.75749 1.89421 3.69141 1.71647 3.69141 1.50684Z"
      fill="#7A818B"
    />
    <path
      d="M7.38281 1.50684C7.38281 1.29264 7.44889 1.11263 7.58105 0.966797C7.71777 0.816406 7.91374 0.741211 8.16895 0.741211C8.42415 0.741211 8.61784 0.816406 8.75 0.966797C8.88672 1.11263 8.95508 1.29264 8.95508 1.50684C8.95508 1.71647 8.88672 1.89421 8.75 2.04004C8.61784 2.18587 8.42415 2.25879 8.16895 2.25879C7.91374 2.25879 7.71777 2.18587 7.58105 2.04004C7.44889 1.89421 7.38281 1.71647 7.38281 1.50684Z"
      fill="#7A818B"
    />
  </svg>
)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }
  const formattedDate = date.toLocaleString('en-US', options)
  const [monthDay, time] = formattedDate.split(', ')

  return `${monthDay} in ${time}`
}

const { Text } = Typography

export const createSingleNotification = (payload: GenericNotification, id: string) => {
  return payload.type === NotificationType.Regular ? (
    <Space direction="vertical">
      <Space size="large" direction="horizontal">
        <Text type="secondary">
          #{payload.id}&ensp;{payload.createdBy}&ensp; on&ensp;
          {payload.createdAt}
        </Text>
      </Space>
      {payload.isRead ? (
        <Collapse
          expandIcon={() => <CollapseIcon />}
          expandIconPosition={'end'}
          ghost
          items={[
            {
              key: id,
              label: (
                <Space direction="horizontal">
                  <Text strong underline>
                    {payload.payload.subject as string}
                  </Text>
                </Space>
              ),
              children: (
                <Card
                  style={{
                    borderRadius: '10px',
                    padding: '10px',
                    background: '#F8F9FF',
                    width: '100%',
                    display: 'inline-flex',
                  }}
                >
                  <Text underline type="secondary">
                    {payload.payload.body}
                  </Text>
                </Card>
              ),
            },
          ]}
        />
      ) : (
        <>
          <Space direction="horizontal">
            <Text strong underline>
              {payload.payload.subject as string}
            </Text>
          </Space>
          <Card
            style={{
              borderRadius: '10px',
              padding: '10px',
              background: '#F8F9FF',
              width: '100%',
              display: 'inline-flex',
            }}
          >
            <Text underline type="secondary">
              {payload.payload.body}
            </Text>
          </Card>
        </>
      )}
    </Space>
  ) : (
    <Space direction="vertical">
      <Space size="large" direction="horizontal">
        <Text type="secondary">
          #{payload.id}&ensp;{payload.payload.committer}&ensp;committed &ensp;on&ensp;
          {formatDate(payload.createdAt)}
        </Text>
      </Space>

      {payload.isRead ? (
        <Collapse
          expandIcon={() => <CollapseIcon />}
          expandIconPosition={'end'}
          ghost
          items={[
            {
              key: id,
              label: (
                <Space direction="horizontal">
                  {/* todo: need icon */}
                  <Text strong underline>
                    {payload.payload.commitName}
                  </Text>
                  {payload.payload.status !== 'open' ? (
                    <Tag color={payload.payload.status === 'rejected' ? ' #DB504A' : '#384BFF'}>
                      {payload.payload.status}
                    </Tag>
                  ) : null}
                </Space>
              ),
              children: (
                <Space direction="vertical">
                  <Card
                    style={{
                      borderRadius: '10px',
                      padding: '10px',
                      background: '#F8F9FF',
                      width: '100%',
                      display: 'inline-flex',
                    }}
                  >
                    <Text underline type="secondary">
                      {payload.payload.committer} asks you to accept changes from{' '}
                      {payload.payload.sourceMutationId} ({payload.payload.committer}){' '}
                      {payload.payload.targetMutationId}
                    </Text>
                  </Card>
                </Space>
              ),
            },
          ]}
        />
      ) : (
        <>
          <Space direction="horizontal">
            {/* todo: need icon */}
            <Text strong underline>
              {payload.payload.commitName}
            </Text>
            {payload.payload.status !== 'open' ? (
              <Tag color={payload.payload.status === 'rejected' ? ' #DB504A' : '#384BFF'}>
                {payload.payload.status}
              </Tag>
            ) : null}
          </Space>
          <Space direction="vertical">
            <Card
              style={{
                borderRadius: '10px',
                padding: '10px',
                background: '#F8F9FF',
                width: '100%',
                display: 'inline-flex',
              }}
            >
              <Text underline type="secondary">
                {`${payload.payload.committer} asks you to accept changes
            from ${payload.payload.sourceMutationId}  (${payload.payload.committer}) ${payload.payload.targetMutationId}`}
              </Text>
            </Card>
          </Space>
        </>
      )}
    </Space>
  )
}
