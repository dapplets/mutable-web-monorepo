import { IContextNode } from '@mweb/core'
import { AppInstanceWithSettings, BosUserLinkWithInstance } from '@mweb/backend'
import { useEngine } from '../engine'
import { useQuery } from '@tanstack/react-query'

// ToDo: workaround
// Reuse reference to empty array to avoid unnecessary re-renders
const NoLinks: BosUserLinkWithInstance[] = []

export const useUserLinks = (
  mutationId: string | null,
  context: IContextNode,
  apps: AppInstanceWithSettings[]
) => {
  const { engine } = useEngine()

  const { data } = useQuery<BosUserLinkWithInstance[]>({
    queryKey: [
      'userLinks',
      {
        mutationId,
        apps: apps.map((app) => app.id),
        context: { namespace: context.namespace, type: context.contextType, id: context.id },
      },
    ],
    queryFn: () =>
      mutationId
        ? engine.userLinkService
            .getAllLinksForContext(apps, mutationId, context)
            .then((links) => (links.length > 0 ? links : NoLinks))
        : Promise.resolve(NoLinks),
    initialData: NoLinks,
  })

  return { links: data }
}
