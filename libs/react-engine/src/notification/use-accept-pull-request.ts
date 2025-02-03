import { EntityId, NotificationDto } from '@mweb/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useAcceptPullRequest = (notificationId: EntityId) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: () => engine.mutationService.acceptPullRequest(notificationId),
    onSuccess: (notification) => {
      queryClient.setQueryData(['notifications'], (prev: NotificationDto[] | undefined) =>
        prev ? prev.map((item) => (item.id === notification.id ? notification : item)) : undefined
      )
    },
  })

  return {
    acceptPullRequest: () => mutateAsync(),
    isLoading: isPending,
    error,
  }
}
