import { EntityId, EntitySourceType, MutationWithSettings } from '@mweb/backend'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

export const useMutation = (
  mutationId: EntityId | undefined | null,
  source: EntitySourceType = EntitySourceType.Origin
) => {
  const queryClient = useQueryClient()

  // ToDo: check it out
  const mutations = queryClient.getQueryData<MutationWithSettings[]>(['mutations']) ?? []

  const mutation = useMemo(
    () =>
      mutationId
        ? mutations.find((mutation) => mutation.id === mutationId && mutation.source === source) ??
          null
        : null,
    [mutations, mutationId, source]
  )

  return { mutation }
}
