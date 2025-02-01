import { ConnectedAccountsRequestStatus, NearNetworks } from '@mweb/backend'
import { RequestStatus } from './connected-accounts-context'
import { useConnectAccounts } from './use-connect-accounts'
import { useConnectedAccounts } from './use-connected-accounts'
import { getMinStakeAmount } from './use-get-min-stake'
import { useGetRequestStatus } from './use-get-request-status'

type MakeConnectionRequestProps = {
  name: string
  origin: string
  isUnlink: boolean
  nearNetwork: NearNetworks
  loggedInAccountId: string
}

export const useConnectionRequest = () => {
  const { updateConnectedAccountsPairs, updateConnectedAccountsNet, requests, setRequests } =
    useConnectedAccounts()
  const { requestVerification, isLoading } = useConnectAccounts()
  const { minStakeAmount } = getMinStakeAmount()
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
        setRequests((previousRequests) => [
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
        ])
      }
      const res = await requestVerification(
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
        setRequests((previousRequests) =>
          previousRequests.map((r) =>
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
        )
        setTimeout(async () => {
          await Promise.all([updateConnectedAccountsNet(), updateConnectedAccountsPairs()])
          setRequests((requests) => requests.filter((request) => request.id !== newRequestId))
        }, 5000)
      }
    } catch (err) {
      console.log(err)
    }
  }

  return { makeConnectionRequest }
}

export default useConnectionRequest
