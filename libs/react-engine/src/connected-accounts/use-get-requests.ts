import { useQuery } from '@tanstack/react-query'
// import { useEngine } from '../engine'

export enum RequestStatus {
  CLAIMING = 'claiming',
  VERIFICATION = 'verification',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEFAULT = 'default',
}

export type CARequest = {
  id: number
  type: string
  payload: Set<string>
  status: RequestStatus
  message?: string
}

export function useGetRequests() {
  //   const { engine } = useEngine()

  const { data, isLoading, error } = useQuery<CARequest[]>({
    queryKey: ['requests'],
    queryFn: () => Promise.resolve([]), // ToDo: engine.connectedAccountsService.getRequests(), ???
  })

  return { requests: data ?? [], isLoading, error }
}
