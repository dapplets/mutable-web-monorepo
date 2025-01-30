import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine'
import { useCallback } from 'react'

export type RequestVerificationProps = {
  firstAccountId: string
  firstOriginId: string
  secondAccountId: string
  secondOriginId: string
  firstProofUrl: string
  isUnlink: boolean
}

export function useConnectAccounts() {
  const queryClient = useQueryClient()
  const { engine } = useEngine()

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({
      verificationProps,
      stake,
    }: {
      newRequestId: number
      verificationProps: RequestVerificationProps
      stake?: number
    }) => {
      return engine.connectedAccountsService.requestVerification(verificationProps, stake)
    },
    onSuccess: (_, { newRequestId }) => {
      queryClient.setQueryData(['requests'], (oldRequests: any) =>
        oldRequests?.map((request: any) =>
          request.id !== newRequestId ? request : { ...request, status: 'VERIFICATION' }
        )
      )
    },
    onError: (err, { newRequestId }) => {
      queryClient.setQueryData(['requests'], (oldRequests: any) =>
        oldRequests?.map((request: any) =>
          request.id !== newRequestId
            ? request
            : {
                ...request,
                status: 'FAILED',
                message: (err as Error)?.message ?? 'Unknown error',
              }
        )
      )

      // Remove failed request after 5 seconds
      setTimeout(() => {
        queryClient.setQueryData(['requests'], (oldRequests: any) =>
          oldRequests?.filter((request: any) => request.id !== newRequestId)
        )
      }, 5000)
      // ToDo: unsubscribe
    },
  })

  const requestVerification = useCallback(
    (newRequestId: number, verificationProps: RequestVerificationProps, stake?: number) => {
      mutate({
        newRequestId,
        verificationProps,
        stake,
      })
    },
    [mutate]
  )

  const requestVerificationAsync = useCallback(
    (newRequestId: number, verificationProps: RequestVerificationProps, stake?: number) => {
      return mutateAsync({
        newRequestId,
        verificationProps,
        stake,
      })
    },
    [mutate]
  )

  return {
    requestVerification,
    requestVerificationAsync,
    isLoading: isPending,
    error,
  }
}
