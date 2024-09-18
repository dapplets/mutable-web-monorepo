import { createContext } from 'react'
import { NotificationDto } from '../../services/notification/dtos/notification.dto'

export type NotificationContextState = {
  notifications: NotificationDto[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationDto[]>>
  isLoading: boolean
  error: string | null
}

export const contextDefaultValues: NotificationContextState = {
  notifications: [],
  setNotifications: () => {},
  isLoading: false,
  error: null,
}

export const NotificationContext = createContext<NotificationContextState>(contextDefaultValues)
