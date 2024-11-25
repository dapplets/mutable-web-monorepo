import { DocumentCommitDto } from '@mweb/backend'
import { createContext } from 'react'

export enum DocumentTaskStatus {
  RECEIVED,
  WAITING,
  SUBMITTED,
  ERROR,
}

export type DocumentTask = {
  document: DocumentCommitDto
  appInstanceId: string
  status: DocumentTaskStatus
}

export type DocumentContextState = {
  documentTask: DocumentTask | null
  setDocumentTask: (newTask: DocumentTask | null) => void
}

const contextDefaultValues: DocumentContextState = {
  documentTask: null,
  setDocumentTask: (newTask: DocumentTask | null) => {},
}

export const DocumentContext = createContext<DocumentContextState>(contextDefaultValues)
