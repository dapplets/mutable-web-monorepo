import { NotificationDto } from '@mweb/backend'
import { useHideNotification, useViewNotification } from '@mweb/react-engine'
import { Button, ButtonProps, Card, Collapse, Space, Typography } from 'antd'
import React, { FC, ReactNode, useMemo } from 'react'
import styled from 'styled-components'
import {
  Collapse as CollapseIcon,
  NotificationClose as NotificationCloseIcon,
  NotificationMessage as NotificationMessageIcon,
} from './assets/icons'
import { formatDate } from './utils'
import { NotificationStatus } from '@mweb/backend/lib/services/notification/resolution.entity'

const { Text } = Typography

const Container = styled(Space)`
  padding: 10px;
  background-color: var(--pure-white);
  border-radius: 10px;
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
`

const StyledButton = styled(Button)<{ $type?: ButtonProps['type'] }>`
  padding: 4px 15px !important;
  border: ${({ $type }) =>
    $type === 'primary' ? '1px solid transparent !important' : '1px solid #d9d9d9 !important'};
`

const StyledCard = styled(Card)`
  display: inline-flex;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: #f8f9ff;
  border: 1px solid #f0f0f0;
`

type TAction = {
  label: string
  type: Required<ButtonProps['type']>
  icon: ReactNode
  hidden?: boolean
  onClick: () => void
}

export const GenericNotification: FC<{
  notification: NotificationDto
  loggedInAccountId: string

  message: ReactNode
  icon: ReactNode
  title: string
  error?: Error | null
  actions?: TAction[]
  disabled?: boolean
  children: ReactNode
}> = ({
  notification,
  loggedInAccountId,
  title,
  icon,
  error,
  actions,
  disabled,
  message,
  children,
}) => {
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

  const date = useMemo(() => formatDate(new Date(notification.timestamp)), [notification.timestamp])

  const areActionsDisabled = isLoadingHide || isLoadingView || disabled

  return (
    <Container prefixCls="notifySingle" direction="vertical">
      {(errorView || errorHide || error) && <Text type="danger">Unknown error</Text>}

      <Space size="large" direction="horizontal" style={{ alignItems: 'flex-start' }}>
        {icon}
        <Text type="secondary" style={{ fontSize: '12px' }}>
          #{notification.localId.substring(0, 7)}&ensp;{title}&ensp;on&ensp;{date}
        </Text>

        {notification.status === NotificationStatus.New ? (
          <StyledButton
            style={{ marginLeft: 'auto' }}
            disabled={areActionsDisabled}
            onClick={viewNotification}
            type="text"
            title="Mark as read"
            icon={<NotificationMessageIcon />}
          />
        ) : (
          <StyledButton
            style={{ marginLeft: 'auto' }}
            disabled={areActionsDisabled}
            onClick={hideNotification}
            type="text"
            title="Delete"
            icon={<NotificationCloseIcon />}
          />
        )}
      </Space>

      <Collapse
        expandIcon={() => <CollapseIcon />}
        expandIconPosition={'end'}
        ghost
        items={[
          {
            key: notification.id,
            label: <Space direction="horizontal">{message}</Space>,
            children: (
              <Space direction="vertical">
                <StyledCard>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {children}
                  </Text>
                </StyledCard>
              </Space>
            ),
          },
        ]}
      />

      {actions && actions.length > 0 ? (
        <Space
          key={notification.id}
          direction="horizontal"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          {actions
            .filter((action) => !action.hidden)
            .map((action, i) => (
              <StyledButton
                key={i}
                disabled={areActionsDisabled}
                $type={action.type as ButtonProps['type']}
                type={action.type as ButtonProps['type']}
                size="middle"
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </StyledButton>
            ))}
        </Space>
      ) : null}
    </Container>
  )
}
