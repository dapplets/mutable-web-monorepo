import { AppId } from '@mweb/backend'
import { DocumentDto } from '@mweb/backend'
import { useMutableWeb } from './use-mutable-web'
import { useQueryArray } from '../../hooks/use-query-array'

export const useAppDocuments = (appId: AppId) => {
  const { engine } = useMutableWeb()

  const { data, isLoading, error } = useQueryArray<DocumentDto>({
    query: () => engine.documentService.getDocumentsByAppId(appId),
    deps: [engine, appId],
  })

  return { documents: data, isLoading, error }
}
