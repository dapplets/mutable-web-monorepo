import React, { FC, ReactNode, useCallback, useEffect, useRef } from 'react'
import { NotificationContext, NotificationContextState } from './notification-context'
import { Button, Space, notification } from 'antd'
import { useViewport } from '../viewport-context'
import { useQueryArray } from '../../hooks/use-query-array'
import { NotificationDto } from '@mweb/backend'
import { useMutableWeb } from '../mutable-web-context'

type Props = {
  children?: ReactNode
  recipientId: string
}

const NotificationProvider: FC<Props> = ({ children, recipientId }) => {
  const { engine } = useMutableWeb()

  const {
    data: notifications,
    setData: setNotifications,
    isLoading,
    error,
  } = useQueryArray<NotificationDto>({
    query: () => engine.notificationService.getNotificationsByRecipient(recipientId),
    deps: [engine, recipientId],
  })

  const state: NotificationContextState = {
    notifications,
    setNotifications,
    isLoading,
    error,
  }

  return (
    <NotificationContext.Provider value={state}>
      <>{children}</>
    </NotificationContext.Provider>
  )
}

export { NotificationProvider }
