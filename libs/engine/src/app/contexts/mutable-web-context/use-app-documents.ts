import { AppId } from '../../services/application/application.entity'
import { DocumentDto } from '../../services/document/dtos/document.dto'
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
