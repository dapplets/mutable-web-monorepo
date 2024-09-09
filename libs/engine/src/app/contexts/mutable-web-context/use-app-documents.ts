import { useCallback, useEffect, useState } from 'react'
import { AppId } from '../../services/application/application.entity'
import { Document } from '../../services/document/document.entity'
import { useMutableWeb } from './use-mutable-web'

export const useAppDocuments = (appId: AppId) => {
  const { engine } = useMutableWeb()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true)

      const documents = await engine.documentService.getDocumentsByAppId(appId)
      setDocuments(documents)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [engine, appId])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  return {
    documents,
    isLoading,
    error,
  }
}
