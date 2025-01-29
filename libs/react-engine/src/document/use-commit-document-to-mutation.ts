import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { DocumentCommitDto, MutationDto } from '@mweb/backend'

export const useCommitDocumentToMutation = () => {
  const { engine } = useEngine()

  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: ({
      appId,
      mutationId,
      document,
    }: {
      appId: string
      mutationId: string
      document: DocumentCommitDto
    }) => engine.documentService.commitDocumentToMutation(mutationId, appId, document),

    onSuccess: async ({ mutation }) => {
      // is mutation changed?
      if (mutation) {
        // ToDo: workaround to wait when blockchain changes will be propagated, remove?
        await new Promise((res) => setTimeout(res, 3000))

        queryClient.setQueryData(['mutations'], (prev: MutationDto[]) => {
          if (!prev) return undefined

          const index = prev.findIndex((m) => m.id === mutation.id && m.source === mutation.source)
          if (index === -1) {
            return [...prev, mutation]
          } else {
            return prev.map((m, i) => (i === index ? mutation : m))
          }
        })
      }
    },
  })

  return {
    commitDocumentToMutation: mutateAsync,
  }
}
