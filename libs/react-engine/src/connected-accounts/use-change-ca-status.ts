import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useCallback } from 'react'

export function useChangeCAStatus() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { isPending, error, mutate } = useMutation({
    mutationFn: async ({ accountId, originId }: { accountId: string; originId: string }) => {
      const status = await engine.connectedAccountsService.getStatus(accountId, originId)
      await engine.connectedAccountsService.changeStatus(accountId, originId, !status)
    },
    onError: (error: any) => {
      // Handle any errors if necessary
      console.error('Error changing CA status:', error)
    },
    onSuccess: (_, { accountId, originId }) => {
      queryClient.invalidateQueries({
        queryKey: ['connectedAccountsPairs', originId, accountId],
      })
    },
  })

  const changeCAStatus = useCallback(
    (accountId: string, originId: string) => mutate({ accountId, originId }),
    [mutate]
  )

  return { changeCAStatus, isLoading: isPending, error }
}
