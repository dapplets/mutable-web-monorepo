import { Engine, NotificationDto } from '@mweb/backend'
import React, { FC, ReactNode } from 'react'
import { useQueryArray } from '../../hooks/use-query-array'
import { NotificationContext, NotificationContextState } from './notification-context'

type Props = {
  engine: Engine
  children?: ReactNode
  recipientId: string | null
}

const NotificationProvider: FC<Props> = ({ engine, children, recipientId }) => {
  const {
    data: notifications,
    setData: setNotifications,
    isLoading,
    error,
  } = useQueryArray<NotificationDto>({
    query: () =>
      recipientId
        ? engine.notificationService.getMyNotifications(recipientId)
        : Promise.resolve([]),
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
