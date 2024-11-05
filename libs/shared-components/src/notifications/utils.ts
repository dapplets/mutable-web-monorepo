import { NotificationDto } from '@mweb/backend'

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }
  const formattedDate = date.toLocaleString('en-US', options)
  const [monthDay, time] = formattedDate.split(', ')

  return `${monthDay} in ${time}`
}

export const sortNotificationsByTimestamp = (notifications: NotificationDto[]) => {
  return notifications.sort((a, b) => b.timestamp - a.timestamp)
}

export const extractLastPart = (inputStr: string) => {
  return inputStr.split('mutation/').pop()
}
