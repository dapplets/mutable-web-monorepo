import React, { FC } from 'react'
import { Tag } from 'antd'
import {
  NotificationDto,
  NotificationType,
  PullRequestPayload,
  PullRequestResult,
  PullRequestStatus,
} from '@mweb/backend'
import { useAcceptPullRequest, useRejectPullRequest } from '@mweb/react-engine'
import { BlueBadge, Branch, Decline, GreenBadge, RedBadge, Review } from './assets/icons'
import { GenericNotification } from './generic-notification'
import { PrReviewerModal } from './pr-reviewer-modal'

export interface PullRequestNotificationDto extends NotificationDto {
  type: NotificationType.PullRequest
  payload: PullRequestPayload
  result: PullRequestResult
}

const PullRequestNotification: FC<{
  notification: PullRequestNotificationDto
  loggedInAccountId: string
}> = ({ notification, loggedInAccountId }) => {
  const { sourceMutationId, targetMutationId } = notification.payload
  const [sourceAuthorId, , sourceLocalMutationId] = sourceMutationId.split('/')
  const [targetAuthorId, , targetLocalMutationId] = targetMutationId.split('/')

  const isOutgoing = loggedInAccountId === notification.authorId

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

  const [isReviewing, setIsReviewing] = React.useState(false)

  const handleModalClose = () => {
    setIsReviewing(false)
  }

  const handleReviewClick = () => {
    setIsReviewing(true)
  }

  const status = notification.result?.status ?? PullRequestStatus.Open

  return (
    <>
      {isReviewing ? (
        <PrReviewerModal notification={notification} onClose={handleModalClose} />
      ) : null}
      <GenericNotification
        notification={notification}
        loggedInAccountId={loggedInAccountId}
        icon={
          status === PullRequestStatus.Accepted ? (
            <GreenBadge />
          ) : status === PullRequestStatus.Rejected ? (
            <RedBadge />
          ) : (
            <BlueBadge />
          )
        }
        title={`${sourceAuthorId} sent a commit to ${targetAuthorId}`} // ToDo: handle multiple recipients
        disabled={isLoadingAccept || isLoadingReject}
        error={errorAccept || errorReject}
        message={
          status === PullRequestStatus.Accepted ? (
            <Tag color="#384BFF">Accepted</Tag>
          ) : status === PullRequestStatus.Rejected ? (
            <Tag color="#DB504A">Rejected</Tag>
          ) : null
        }
        children={`${sourceAuthorId} asks ${targetAuthorId} to accept changes from ${sourceLocalMutationId} to ${targetLocalMutationId}`}
        actions={[
          {
            label: 'Decline',
            type: 'default',
            icon: <Decline />,
            onClick: rejectPullRequest,
            hidden: isOutgoing || status !== PullRequestStatus.Open,
          },
          {
            label: 'Review',
            type: 'default',
            icon: <Review />,
            onClick: handleReviewClick,
            hidden: isOutgoing || status !== PullRequestStatus.Open,
          },
          {
            label: 'Accept',
            type: 'primary',
            icon: <Branch />,
            onClick: acceptPullRequest,
            hidden: isOutgoing || status !== PullRequestStatus.Open,
          },
        ]}
      />
    </>
  )
}

export default PullRequestNotification
