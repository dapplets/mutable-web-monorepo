import { EntityId, NotificationDto } from '@mweb/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useHideNotification = (notificationId: EntityId) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => engine.notificationService.hideNotification(notificationId),
    onSuccess: (notification) => {
      queryClient.setQueryData(['notifications'], (prev: NotificationDto[] | undefined) =>
        prev ? prev.map((item) => (item.id === notification.id ? notification : item)) : undefined
      )
    },
  })

  return {
    hideNotification: () => mutate(),
    isLoading: isPending,
    error,
  }
}
