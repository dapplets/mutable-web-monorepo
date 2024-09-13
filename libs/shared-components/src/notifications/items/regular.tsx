import React, { FC } from 'react'
import { GenericNotification, NotificationType } from '../types'
import { createSingleNotification } from '../utils/createSingleNotification'

export interface RegularProps {
  notification: GenericNotification<NotificationType.Regular>
}

export const RegularItem: FC<RegularProps> = ({ notification }) => {
  return createSingleNotification(notification, `${Date.now()}`)
}
