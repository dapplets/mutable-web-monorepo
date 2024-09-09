import { createContext } from 'react'
export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export type ModalProps = {
  subject: string
  body: string
  type: NotificationType
  duration?: number
  actions?: {
    label: string
    type?: 'primary' | 'default'
    onClick?: () => void
  }[]
}

// ToDo: rename to NotificationContext
export type ModalContextState = {
  notify: (modalProps: ModalProps) => void
}

export const contextDefaultValues: ModalContextState = {
  notify: () => {},
}

export const ModalContext = createContext<ModalContextState>(contextDefaultValues)
