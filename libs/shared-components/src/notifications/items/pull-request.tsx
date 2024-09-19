import React, { FC } from 'react'
import { GenericNotification, NotificationType } from '../types'
import { createSingleNotification } from '../utils/createSingleNotification'

export interface PullRequestProps {
  notification: GenericNotification<NotificationType.PullRequest>
}

export const PullRequestItem: FC<PullRequestProps> = ({ notification }) => {
  return createSingleNotification(notification, `${Date.now()}`)
}
