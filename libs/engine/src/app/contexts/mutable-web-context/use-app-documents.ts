import { AppId } from '../../services/application/application.entity'
import { Document } from '../../services/document/document.entity'
import { useMutableWeb } from './use-mutable-web'
import { useQueryArray } from '../../hooks/use-query-array'

export const useAppDocuments = (appId: AppId) => {
  const { engine } = useMutableWeb()

  const { data, isLoading, error } = useQueryArray<Document>({
    query: () => engine.documentService.getDocumentsByAppId(appId),
    deps: [engine, appId],
  })

  return { documents: data, isLoading, error }
}
