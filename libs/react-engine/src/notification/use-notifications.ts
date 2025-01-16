import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useNotifications(recipientId?: string | null) {
  const { engine } = useEngine()

  const {
    data: notifications,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      recipientId
        ? engine.notificationService.getMyNotifications(recipientId)
        : Promise.resolve([]),
    initialData: [],
  })

  return {
    notifications,
    isLoading,
    error,
  }
}
