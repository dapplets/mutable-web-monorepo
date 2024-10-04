import { MutableWebContext } from './mutable-web-context'
import { MutationId } from '../../services/mutation/mutation.entity'
import { useContext, useMemo } from 'react'

export const useMutation = (mutationId: MutationId) => {
  const { mutations } = useContext(MutableWebContext)

  const mutation = useMemo(
    () => mutations.find((mutation) => mutation.id === mutationId) ?? null,
    [mutations, mutationId]
  )

  return { mutation }
}
