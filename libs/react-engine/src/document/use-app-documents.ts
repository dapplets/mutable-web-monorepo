import { AppId } from '@mweb/backend'
import { useQuery } from '@tanstack/react-query'
import { useEngine } from '../engine'

export const useAppDocuments = (appId: AppId) => {
  const { engine } = useEngine()

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', appId],
    queryFn: () => engine.documentService.getDocumentsByAppId(appId),
    initialData: [],
  })

  return { documents: data, isLoading, error }
}
