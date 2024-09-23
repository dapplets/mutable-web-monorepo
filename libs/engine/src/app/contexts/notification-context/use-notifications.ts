import { useContext } from 'react'
import { NotificationContext } from './notification-context'

export function useNotifications() {
  return useContext(NotificationContext)
}
