import { EntityId, NotificationDto } from '@mweb/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useRejectPullRequest = (notificationId: EntityId) => {
  const { engine } = useEngine()
  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: () => engine.mutationService.rejectPullRequest(notificationId),
    onSuccess: (notification) => {
      queryClient.setQueryData(['notifications'], (prev: NotificationDto[] | undefined) =>
        prev ? prev.map((item) => (item.id === notification.id ? notification : item)) : undefined
      )
    },
  })

  return {
    rejectPullRequest: () => mutateAsync(),
    isLoading: isPending,
    error,
  }
}
