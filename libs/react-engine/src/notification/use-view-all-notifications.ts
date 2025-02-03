import { EntityId, NotificationDto } from '@mweb/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useViewAllNotifications = (notificationId: EntityId) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => engine.notificationService.viewAllNotifcations(notificationId),
    onSuccess: (notifications) => {
      queryClient.setQueryData(['notifications'], (prev: NotificationDto[]) =>
        prev ? prev.map((item) => notifications.find((x) => x.id === item.id) ?? item) : undefined
      )
    },
  })

  return {
    viewAllNotifications: () => mutate(),
    isLoading: isPending,
    error,
  }
}
