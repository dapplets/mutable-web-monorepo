import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export function useNotifications(recipientId?: string | null) {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      recipientId
        ? engine.notificationService.getMyNotifications(recipientId)
        : Promise.resolve([]),
  })

  return {
    notifications: data ?? [],
    isLoading,
    error,
  }
}
