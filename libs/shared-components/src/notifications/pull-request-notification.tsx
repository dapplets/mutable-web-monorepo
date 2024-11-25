import React, { FC, useMemo } from 'react'
import { Space, Typography, Card, Tag, Collapse, Button, ButtonProps } from 'antd'
import {
  useAcceptPullRequest,
  useHideNotification,
  useRejectPullRequest,
  useViewNotification,
} from '@mweb/engine'
import {
  NotificationDto,
  NotificationType,
  PullRequestPayload,
  PullRequestResult,
} from '@mweb/backend'
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
import { extractLastPart, formatDate } from './utils'
import styled from 'styled-components'
import { PrReviewerModal } from './pr-reviewer-modal'

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
  type:
    | NotificationType.PullRequest
    | NotificationType.PullRequestAccepted
    | NotificationType.PullRequestRejected
  payload: PullRequestPayload
  result: PullRequestResult
}

const PullRequestNotification: FC<{
  notification: PullRequestNotificationDto
  modalContainerRef: React.RefObject<HTMLElement>
  loggedInAccountId: string
}> = ({ notification, modalContainerRef, loggedInAccountId }) => {
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

  const date = useMemo(() => formatDate(new Date(notification.timestamp)), [notification.timestamp])

  const [isReviewing, setIsReviewing] = React.useState(false)

  const handleModalClose = () => {
    setIsReviewing(false)
  }

  const handleReviewClick = () => {
    setIsReviewing(true)
  }

  const handleActionClick = async (action: TAction) => {
    try {
      if (action.label === 'Accept') {
        await acceptPullRequest()
      } else if (action.label === 'Decline') {
        await rejectPullRequest()
      } else if (action.label === 'Review') {
        await handleReviewClick()
      }
    } catch (e) {
      console.error(e)
    }
  }
  console.log(notification)

  return (
    <>
      {isReviewing ? (
        <PrReviewerModal
          notification={notification}
          containerRef={modalContainerRef}
          onClose={handleModalClose}
        />
      ) : null}
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
          {loggedInAccountId === notification.authorId ||
          notification.type === NotificationType.PullRequest ? (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              #{notification.localId.substring(0, 7)}&ensp;{loggedInAccountId}&ensp;sent a commit
              to&ensp;
              {notification.type === NotificationType.PullRequest
                ? notification.authorId
                : notification.recipients}
              &ensp;on&ensp;
              {date}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              #{notification.localId.substring(0, 7)}&ensp;{notification.authorId}
              &ensp;committed &ensp;on&ensp;
              {date}
            </Text>
          )}

          <Button
            disabled={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
            onClick={
              notification.status === 'new' && notification.authorId !== loggedInAccountId
                ? viewNotification
                : hideNotification
            }
            style={{ marginLeft: 'auto' }}
            type="text"
            title={
              notification.status === 'new' && notification.authorId !== loggedInAccountId
                ? 'Mark as read'
                : 'Delete'
            }
            icon={
              notification.status === 'new' && notification.authorId !== loggedInAccountId ? (
                <NotificationMessageIcon />
              ) : (
                <NotificationCloseIcon />
              )
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
                  {loggedInAccountId === notification.authorId ? (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {loggedInAccountId}&ensp;asks&ensp;{notification.recipients}&ensp;to accept
                      changes from {extractLastPart(notification.payload!.sourceMutationId)} to{' '}
                      {extractLastPart(notification.payload!.targetMutationId)}
                    </Text>
                  ) : notification.type === NotificationType.PullRequestAccepted ||
                    notification.type === NotificationType.PullRequestRejected ? (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {notification.authorId}&ensp;asks&ensp;{notification.recipients}&ensp;to
                      accept changes from {extractLastPart(notification.payload!.sourceMutationId)}{' '}
                      to {extractLastPart(notification.payload!.targetMutationId)}
                    </Text>
                  ) : (
                    <StyledCard>
                      <Text style={{ padding: '0' }} type="secondary">
                        <Text type="secondary" underline>
                          {notification.authorId}
                        </Text>{' '}
                        asks you to accept changes from{' '}
                        <Text type="secondary" underline>
                          {extractLastPart(notification.payload!.sourceMutationId)}
                        </Text>{' '}
                        &ensp; ({notification.recipients[0]}) into your{' '}
                        <Text type="secondary" underline>
                          {extractLastPart(notification.payload!.targetMutationId)}
                        </Text>{' '}
                      </Text>
                    </StyledCard>
                  )}
                </Space>
              ),
            },
          ]}
        />

        {notification.result?.status !== 'accepted' &&
        notification.result?.status !== 'rejected' ? (
          <Space
            key={notification.id}
            direction="horizontal"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            {loggedInAccountId === notification.authorId ||
            notification.type === NotificationType.PullRequestAccepted ||
            notification.type === NotificationType.PullRequestRejected
              ? null
              : actions.map((action, i) => (
                  <Button
                    key={i}
                    disabled={isLoadingAccept || isLoadingHide || isLoadingReject || isLoadingView}
                    type={action.type as ButtonProps['type']}
                    size="middle"
                    onClick={() => handleActionClick(action)}
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
    </>
  )
}

export default PullRequestNotification
