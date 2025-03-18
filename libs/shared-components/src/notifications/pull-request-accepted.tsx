import React, { FC } from 'react'
import { Tag } from 'antd'
import { NotificationDto, NotificationType, PullRequestAcceptedPayload } from '@mweb/backend'
import { GreenBadge } from './assets/icons'
import { GenericNotification } from './generic-notification'

export interface PullRequestAcceptedNotificationDto extends NotificationDto {
  type: NotificationType.PullRequestAccepted
  payload: PullRequestAcceptedPayload
}

const PullRequestAccepted: FC<{
  notification: PullRequestAcceptedNotificationDto
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
      title={`${targetAuthorId} commited commit from ${sourceAuthorId}`} // ToDo: handle multiple recipients
      message={
        <Tag style={{ padding: '0 7px', border: '1px solid #384BFF' }} color="#384BFF">
          Accepted
        </Tag>
      }
      children={`${sourceAuthorId} asks ${targetAuthorId} to accept changes from ${sourceLocalMutationId} to ${targetLocalMutationId}`}
    />
  )
}

export default PullRequestAccepted
