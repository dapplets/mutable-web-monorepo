import React, { FC } from 'react'
import { Space, Typography, Card, Tag, Collapse, Button, ButtonProps } from 'antd'
import {
  NotificationDto,
  useAcceptPullRequest,
  useHideNotification,
  useRejectPullRequest,
  useViewNotification,
} from '@mweb/engine'
import { RegularPayload } from '@mweb/engine/lib/app/services/notification/types/regular'
import { PullRequestPayload } from '@mweb/engine/lib/app/services/notification/types/pull-request'
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
const { Text } = Typography

const actions = [
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

const Notification: FC<{
  notification: NotificationDto
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

  const date = new Date(notification.timestamp)

  const isRegularPayload = (
    payload: RegularPayload | PullRequestPayload | null
  ): payload is RegularPayload => {
    if (payload === null) return false
    return payload && 'subject' in payload
  }

  return isRegularPayload(notification.payload) ? (
    <Space prefixCls="notifySingle" direction="vertical" style={{ transition: 'all 0.2s ease' }}>
      {(errorView || errorHide) && <Text type="danger">Unknown error</Text>}
      <Space size="large" direction="horizontal" style={{ alignItems: 'flex-start' }}>
        <BlueBadge />
        <Text type="secondary" style={{ fontSize: '12px' }}>
          #{notification.localId.substring(0, 7)}&ensp;{notification.authorId}&ensp; on&ensp;
          {formatDate(date.toLocaleString())}
        </Text>
        <Button
          loading={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
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
                <Card
                  style={{
                    borderRadius: '10px',
                    padding: '10px',
                    background: '#F8F9FF',
                    width: '100%',
                    display: 'inline-flex',
                  }}
                >
                  <Text style={{ padding: '0' }} underline type="secondary">
                    {notification.payload.body as string}
                  </Text>
                </Card>
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
          <Card
            style={{
              borderRadius: '10px',
              padding: '10px',
              background: '#F8F9FF',
              width: '100%',
              display: 'inline-flex',
            }}
          >
            <Text style={{ padding: '0' }} underline type="secondary">
              {notification.payload.body}
            </Text>
          </Card>
        </>
      )}
    </Space>
  ) : (
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
          {formatDate(date.toLocaleString())}
        </Text>
        <Button
          loading={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
          onClick={notification.status === 'new' ? viewNotification : hideNotification}
          style={{ marginLeft: 'auto' }}
          type="text"
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
                <Card
                  style={{
                    borderRadius: '10px',
                    padding: '10px',
                    background: '#F8F9FF',
                    width: '100%',
                    display: 'inline-flex',
                  }}
                >
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
                </Card>
              </Space>
            ),
          },
        ]}
      />

      {!isRegularPayload(notification.payload) &&
      notification.result?.status !== 'accepted' &&
      notification.result?.status !== 'rejected' ? (
        <Space key={notification.id} direction="horizontal">
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
              onClick={() => {
                if (action.label === 'Accept') acceptPullRequest && acceptPullRequest()
                if (action.label === 'Decline') rejectPullRequest && rejectPullRequest()
              }}
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

export default Notification
