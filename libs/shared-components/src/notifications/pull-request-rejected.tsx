import React, { FC } from 'react'
import { Tag } from 'antd'
import { NotificationDto, NotificationType, PullRequestRejectedPayload } from '@mweb/backend'
import { GreenBadge } from './assets/icons'
import { GenericNotification } from './generic-notification'

export interface PullRequestRejectedNotificationDto extends NotificationDto {
  type: NotificationType.PullRequestRejected
  payload: PullRequestRejectedPayload
}

const PullRequestRejected: FC<{
  notification: PullRequestRejectedNotificationDto
  loggedInAccountId: string
}> = ({ notification, loggedInAccountId }) => {
  // Do not show notification for senders
  if (!notification.recipients.includes(loggedInAccountId)) {
    return null
  }

  const { sourceMutationId, targetMutationId } = notification.payload
  const [sourceAuthorId, , sourceLocalMutationId] = sourceMutationId.split('/')
  const [targetAuthorId, , targetLocalMutationId] = targetMutationId.split('/')

  return (
    <GenericNotification
      notification={notification}
      loggedInAccountId={loggedInAccountId}
      icon={<GreenBadge />}
      title={`${targetAuthorId} rejected PR from ${sourceAuthorId}`} // ToDo: handle multiple recipients
      message={<Tag color="#DB504A">Rejected</Tag>}
      children={`${sourceAuthorId} asks ${targetAuthorId} to accept changes from ${sourceLocalMutationId} to ${targetLocalMutationId}`}
    />
  )
}

export default PullRequestRejected
