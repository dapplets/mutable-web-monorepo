import { useCallback } from 'react'
import { useMutableWeb } from '../mutable-web-context'
import { useMutations } from './use-mutations'

export const useRemoveMutationFromRecents = () => {
  const { engine } = useMutableWeb()
  const { setMutations } = useMutations()

  const removeMutationFromRecents = useCallback(
    async (mutationId: string) => {
      try {
        await engine.mutationService.removeMutationFromRecents(mutationId)

        setMutations((prev) =>
          prev.map((mut) =>
            mut.id === mutationId ? { ...mut, settings: { ...mut.settings, lastUsage: null } } : mut
          )
        )
      } catch (err) {
        console.error(err)
      }
    },
    [engine]
  )

  return { removeMutationFromRecents }
}
