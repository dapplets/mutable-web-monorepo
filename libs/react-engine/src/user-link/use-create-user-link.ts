import { IContextNode } from '@mweb/core'
import { AppInstanceWithSettings, BosUserLinkWithInstance } from '@mweb/backend'
import { useEngine } from '../engine'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCreateUserLink = (
  mutationId: string | null,
  context: IContextNode,
  apps: AppInstanceWithSettings[]
) => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (appId: string) => {
      if (!mutationId) throw new Error('mutationId is required')
      return engine.userLinkService.createLink(mutationId, appId, context)
    },
    onSuccess: (createdLink, appId) => {
      const key = [
        'userLinks',
        {
          mutationId,
          apps: apps.map((app) => app.id),
          context: { namespace: context.namespace, type: context.contextType, id: context.id },
        },
      ]

      const appInstances = apps.filter((app) => app.id === appId)

      // ToDo: should we allow to run multiple instances for user link apps?
      const linkWithInstance = appInstances.map((instance) => ({
        ...createdLink,
        appInstanceId: instance.instanceId,
      }))

      queryClient.setQueryData(key, (prev: BosUserLinkWithInstance[]) =>
        prev ? [...prev, ...linkWithInstance] : undefined
      )
    },
  })

  return {
    createUserLink: async (appId: string) => {
      await mutateAsync(appId)
    },
  }
}
