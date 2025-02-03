import { EntityId, NotificationDto } from '@mweb/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useViewNotification = (notificationId: EntityId) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => engine.notificationService.viewNotification(notificationId),
    onSuccess: (notification) => {
      queryClient.setQueryData(['notifications'], (prev: NotificationDto[]) =>
        prev ? prev.map((item) => (item.id === notification.id ? notification : item)) : undefined
      )
    },
  })

  return {
    viewNotification: () => mutate(),
    isLoading: isPending,
    error,
  }
}
