import React, { FC, useMemo } from 'react'
import { Space, Typography, Card, Collapse, Button } from 'antd'
import { useHideNotification, useViewNotification } from '@mweb/engine'
import { NotificationDto, NotificationType, RegularPayload } from '@mweb/backend'
import {
  Collapse as CollapseIcon,
  BlueBadge,
  NotificationMessage as NotificationMessageIcon,
  NotificationClose as NotificationCloseIcon,
} from './assets/icons'
import { formatDate } from './utils'
import styled from 'styled-components'

const { Text } = Typography

const StyledCard = styled(Card)`
  display: inline-flex;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: #f8f9ff;
`

export interface RegularNotificationDto extends NotificationDto {
  type: NotificationType.Regular
  payload: RegularPayload
  result: null
}

const RegularNotification: FC<{
  notification: RegularNotificationDto
}> = ({ notification }) => {
  const {
    viewNotification,
    isLoading: isLoadingView,
    error: errorView,
  } = useViewNotification(notification.id)
  const {
    hideNotification,
    isLoading: isLoadingHide,
    error: errorHide,
  } = useHideNotification(notification.id)

  const date = useMemo(
    () => formatDate(new Date(notification.timestamp).toLocaleString()),
    [notification.timestamp]
  )

  return (
    <Space prefixCls="notifySingle" direction="vertical" style={{ transition: 'all 0.2s ease' }}>
      {(errorView || errorHide) && <Text type="danger">Unknown error</Text>}
      <Space size="large" direction="horizontal" style={{ alignItems: 'flex-start' }}>
        <BlueBadge />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          #{notification.localId.substring(0, 7)}&ensp;{notification.authorId}&ensp; on&ensp;
          {date}
        </Text>
        <Button
          loading={isLoadingHide || isLoadingView}
          onClick={notification.status === 'new' ? viewNotification : hideNotification}
          style={{ marginLeft: 'auto' }}
          type="text"
          icon={
            notification.status === 'new' ? <NotificationMessageIcon /> : <NotificationCloseIcon />
          }
        />
      </Space>

      {notification.status === 'viewed' ? (
        <Collapse
          expandIcon={() => <CollapseIcon />}
          expandIconPosition={'end'}
          ghost
          items={[
            {
              key: notification.id,
              label:
                notification.payload.subject !== null ? (
                  <Space direction="horizontal">
                    <BlueBadge />
                    <Text strong underline>
                      {notification.payload.subject as string}
                    </Text>
                  </Space>
                ) : (
                  <Space direction="horizontal">
                    <BlueBadge />
                    <Text strong underline>
                      {notification.type as string}
                    </Text>
                  </Space>
                ),
              children: (
                <StyledCard>
                  <Text style={{ padding: '0' }} underline type="secondary">
                    {notification.payload.body as string}
                  </Text>
                </StyledCard>
              ),
            },
          ]}
        />
      ) : (
        <>
          <Space direction="horizontal">
            <BlueBadge />
            <Text strong underline>
              {notification.payload.subject as string}
            </Text>
          </Space>
          <StyledCard>
            <Text style={{ padding: '0' }} underline type="secondary">
              {notification.payload.body}
            </Text>
          </StyledCard>
        </>
      )}
    </Space>
  )
}

export default RegularNotification
