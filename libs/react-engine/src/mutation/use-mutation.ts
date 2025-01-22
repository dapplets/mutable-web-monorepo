import { EntityId, EntitySourceType } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useMutation = (
  mutationId: EntityId | undefined | null,
  source: EntitySourceType = EntitySourceType.Origin
) => {
  const { engine } = useEngine()

  const { data: mutation } = useQuery({
    queryKey: ['mutation', { mutationId, source }],
    queryFn: () =>
      mutationId ? engine.mutationService.getMutation(mutationId, source) : Promise.resolve(null),
    initialData: null,
  })

  return { mutation }
}
