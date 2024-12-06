import { DocumentCommitDto } from '@mweb/backend'
import { createContext } from 'react'

export type DocumentTask = {
  document: DocumentCommitDto
  appInstanceId: string
  onReject: () => void
  onResolve: (document: DocumentCommitDto) => void
}

export type DocumentContextState = {
  documentTask: DocumentTask | null
  setDocumentTask: (newTask: DocumentTask | null) => void
  rejectDocumentTask: () => void
  resolveDocumentTask: (document: DocumentCommitDto) => void
}

const contextDefaultValues: DocumentContextState = {
  documentTask: null,
  setDocumentTask: () => undefined,
  rejectDocumentTask: () => undefined,
  resolveDocumentTask: () => undefined,
}

export const DocumentContext = createContext<DocumentContextState>(contextDefaultValues)
