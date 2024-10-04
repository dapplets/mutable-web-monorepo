import React, { FC, useMemo } from 'react'
import { Space, Typography, Card, Tag, Collapse, Button, ButtonProps } from 'antd'
import {
  NotificationDto,
  NotificationType,
  useAcceptPullRequest,
  useHideNotification,
  useRejectPullRequest,
  useViewNotification,
  PullRequestPayload,
  PullRequestResult,
} from '@mweb/engine'
import {
  Collapse as CollapseIcon,
  BlueBadge,
  RedBadge,
  GreenBadge,
  NotificationMessage as NotificationMessageIcon,
  NotificationClose as NotificationCloseIcon,
  Decline,
  Review,
  Branch,
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

type TAction = {
  label: string
  type: Required<ButtonProps['type']>
  icon: React.JSX.Element
}

const actions: TAction[] = [
  {
    label: 'Decline',
    type: 'default',
    icon: <Decline />,
  },
  {
    label: 'Review',
    type: 'default',
    icon: <Review />,
  },
  {
    label: 'Accept',
    type: 'primary',
    icon: <Branch />,
  },
]

export interface PullRequestNotificationDto extends NotificationDto {
  type: NotificationType.PullRequest
  payload: PullRequestPayload
  result: PullRequestResult
}

const PullRequestNotification: FC<{
  notification: PullRequestNotificationDto
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
  const {
    acceptPullRequest,
    isLoading: isLoadingAccept,
    error: errorAccept,
  } = useAcceptPullRequest(notification.id)
  const {
    rejectPullRequest,
    isLoading: isLoadingReject,
    error: errorReject,
  } = useRejectPullRequest(notification.id)

  const date = useMemo(
    () => formatDate(new Date(notification.timestamp).toLocaleString()),
    [notification.timestamp]
  )

  const handleAction = async (action: TAction) => {
    try {
      if (action.label === 'Accept' && !!acceptPullRequest) {
        await acceptPullRequest()
      } else if (action.label === 'Decline' && !!rejectPullRequest) {
        await rejectPullRequest()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Space prefixCls="notifySingle" direction="vertical">
      {(errorView || errorHide || errorAccept || errorReject) && (
        <Text type="danger">Unknown error</Text>
      )}

      <Space size="large" direction="horizontal" style={{ alignItems: 'flex-start' }}>
        {notification.result && notification.result.status === 'accepted' ? (
          <GreenBadge />
        ) : notification.result && notification.result.status === 'rejected' ? (
          <RedBadge />
        ) : (
          <BlueBadge />
        )}

        <Text type="secondary" style={{ fontSize: '12px' }}>
          #{notification.localId.substring(0, 7)}&ensp;{notification.authorId}&ensp;committed
          &ensp;on&ensp;
          {date}
        </Text>

        <Button
          loading={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
          onClick={notification.status === 'new' ? viewNotification : hideNotification}
          style={{ marginLeft: 'auto' }}
          type="text"
          title={notification.status === 'new' ? 'Mark as read' : 'Delete'}
          icon={
            notification.status === 'new' ? <NotificationMessageIcon /> : <NotificationCloseIcon />
          }
        />
      </Space>

      <Collapse
        expandIcon={() => <CollapseIcon />}
        expandIconPosition={'end'}
        ghost
        items={[
          {
            key: notification.id,
            label: (
              <Space direction="horizontal">
                {notification.result && notification.result.status !== 'open' ? (
                  <Tag
                    color={
                      notification.result && notification.result.status === 'rejected'
                        ? ' #DB504A'
                        : '#384BFF'
                    }
                  >
                    {notification.result.status}
                  </Tag>
                ) : null}
              </Space>
            ),
            children: (
              <Space direction="vertical">
                <StyledCard>
                  <Text style={{ padding: '0' }} type="secondary">
                    <Text type="secondary" underline>
                      {notification.authorId}
                    </Text>{' '}
                    asks you to accept changes from{' '}
                    <Text type="secondary" underline>
                      {notification.payload!.sourceMutationId}
                    </Text>{' '}
                    &ensp; ({notification.recipients[0]}) into your{' '}
                    <Text type="secondary" underline>
                      {notification.payload!.targetMutationId}
                    </Text>{' '}
                  </Text>
                </StyledCard>
              </Space>
            ),
          },
        ]}
      />

      {notification.result?.status !== 'accepted' && notification.result?.status !== 'rejected' ? (
        <Space
          key={notification.id}
          direction="horizontal"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          {actions.map((action, i) => (
            <Button
              key={i}
              disabled={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
              loading={
                action.label === 'Accept'
                  ? isLoadingAccept
                  : action.label === 'Decline'
                    ? isLoadingReject
                    : undefined
              }
              type={action.type as ButtonProps['type']}
              size="middle"
              onClick={() => handleAction(action)}
            >
              {(action.label !== 'Accept' && isLoadingAccept) ||
              (action.label === 'Decline' && isLoadingReject)
                ? null
                : action.icon}

              {action.label}
            </Button>
          ))}
        </Space>
      ) : null}
    </Space>
  )
}

export default PullRequestNotification
