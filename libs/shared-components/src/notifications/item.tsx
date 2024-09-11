import React, { FC } from 'react'
import { GenericNotification } from './types'
import { createSingleNotification } from './utils/createSingleNotification'

export const Item: FC<{ notification: GenericNotification }> = ({ notification }) => {
  return createSingleNotification(notification, `${Date.now()}`)
}
