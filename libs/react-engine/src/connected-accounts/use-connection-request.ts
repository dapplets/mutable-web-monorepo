import { ConnectedAccountsRequestStatus, NearNetworks } from '@mweb/backend'
import { useGetRequests, RequestStatus, CARequest } from './use-get-requests'
import { useGetMinStake } from './use-get-min-stake'
import { useConnectAccounts } from './use-connect-accounts'
import { useGetRequestStatus } from './use-get-request-status'
import { useQueryClient } from '@tanstack/react-query'

type MakeConnectionRequestProps = {
  name: string
  origin: string
  isUnlink: boolean
  nearNetwork: NearNetworks
  loggedInAccountId: string
}

export const useConnectionRequest = () => {
  const queryClient = useQueryClient()

  const { requests } = useGetRequests()
  const { requestVerificationAsync, isLoading } = useConnectAccounts()
  const { minStakeAmount } = useGetMinStake()
  const { getRequestStatus } = useGetRequestStatus()

  const waitForRequestResolve = async (
    id: number
  ): Promise<ConnectedAccountsRequestStatus | null> => {
    try {
      const requestStatus = await getRequestStatus(id)
      if (
        requestStatus === ConnectedAccountsRequestStatus.Pending ||
        requestStatus === ConnectedAccountsRequestStatus.NotFound
      ) {
        await new Promise((res) => setTimeout(res, 5000))
        return waitForRequestResolve(id)
      } else {
        return requestStatus
      }
    } catch (err) {
      console.log(err)
      return ConnectedAccountsRequestStatus.Rejected
    }
  }

  const makeConnectionRequest = async ({
    name,
    origin,
    isUnlink,
    nearNetwork,
    loggedInAccountId,
  }: MakeConnectionRequestProps) => {
    const newRequestId = Date.now()
    const firstAccountId = name
    const firstOriginId = origin.toLowerCase()
    const secondAccountId = loggedInAccountId
    const secondOriginId = 'near/' + nearNetwork.toLowerCase() // ToDo: hardcoded
    const firstProofUrl = `https://${origin.toLowerCase()}.com/` + name // ToDo: hardcoded: can be different URLs + less secure
    try {
      const sameTypeRequestPayloads = requests
        .filter((request) => request.type === (isUnlink ? 'disconnect' : 'connect'))
        .map((request) => request.payload)
      if (
        sameTypeRequestPayloads.length > 0 &&
        sameTypeRequestPayloads.find(
          (p) =>
            p.has(`${firstAccountId}/${firstOriginId}`) &&
            p.has(`${secondAccountId}/${secondOriginId}`)
        )
      ) {
        // ToDo: what?
      } else {
        queryClient.setQueryData(['requests'], (previousRequests: CARequest[] | undefined) =>
          previousRequests
            ? [
                ...previousRequests,
                {
                  id: newRequestId,
                  type: isUnlink ? 'disconnect' : 'connect',
                  payload: new Set([
                    `${firstAccountId}/${firstOriginId}`,
                    `${secondAccountId}/${secondOriginId}`,
                  ]),
                  status: RequestStatus.SIGNING,
                },
              ]
            : undefined
        )
      }
      const res = await requestVerificationAsync(
        newRequestId,
        {
          firstAccountId,
          firstOriginId,
          secondAccountId,
          secondOriginId,
          firstProofUrl,
          isUnlink,
        },
        minStakeAmount ?? undefined
      )
      if (res) {
        const requestStatus = await waitForRequestResolve(res)
        queryClient.setQueryData(['requests'], (previousRequests: CARequest[] | undefined) =>
          previousRequests
            ? previousRequests.map((r) =>
                r.id === newRequestId
                  ? {
                      ...r,
                      status:
                        requestStatus === 'approved' ? RequestStatus.SUCCESS : RequestStatus.FAILED,
                      message:
                        requestStatus === 'rejected'
                          ? 'The transaction was rejected. Go to your social network profile and check if the connection condition is met.' // ToDo: hardcoded
                          : undefined,
                    }
                  : r
              )
            : undefined
        )
        setTimeout(async () => {
          // ToDo: invalidate respecting {originId, accountId}
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'connectedAccountsNet',
          })

          // ToDo: invalidate respecting {originId, accountId}
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'connectedAccountsPairs',
          })

          queryClient.setQueryData(['requests'], (previousRequests: CARequest[] | undefined) =>
            previousRequests ? requests.filter((request) => request.id !== newRequestId) : undefined
          )
        }, 5000)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return { makeConnectionRequest }
}

export default useConnectionRequest
