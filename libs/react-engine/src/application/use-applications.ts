import { ApplicationDto } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useApplications = () => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery<ApplicationDto[]>({
    queryKey: ['applications'],
    queryFn: () => engine.applicationService.getApplications(),
    initialData: [],
  })

  return { applications: data, isLoading, error }
}
