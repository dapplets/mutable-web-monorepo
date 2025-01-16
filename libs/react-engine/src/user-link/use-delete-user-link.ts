import { IContextNode } from '@mweb/core'
import { AppInstanceWithSettings, BosUserLinkWithInstance, UserLinkId } from '@mweb/backend'
import { useEngine } from '../engine'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDeleteUserLink = (
  mutationId: string | null,
  context: IContextNode,
  apps: AppInstanceWithSettings[]
) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (linkId: UserLinkId) => engine.userLinkService.deleteUserLink(linkId),
    onSuccess: (_, linkId) => {
      const key = [
        'userLinks',
        {
          mutationId,
          apps: apps.map((app) => app.id),
          context: { namespace: context.namespace, type: context.contextType, id: context.id },
        },
      ]

      queryClient.setQueryData(key, (prev: BosUserLinkWithInstance[]) =>
        prev.filter((link) => link.id !== linkId)
      )
    },
  })

  return {
    deleteUserLink: async (linkId: UserLinkId) => {
      await mutateAsync(linkId)
    },
  }
}
