import React, { FC, ReactElement, useEffect } from 'react'
import { DocumentContext, DocumentContextState, DocumentTask } from './document-context'
import { DocumentCommitDto } from '@mweb/backend'

type Props = {
  children?: ReactElement
}

const DocumentProvider: FC<Props> = ({ children }) => {
  const [documentTask, setDocumentTask] = React.useState<DocumentTask | null>(null)

  const rejectDocumentTask = () => {
    if (!documentTask) return
    documentTask.onReject()
    setDocumentTask(null)
  }

  const commitDocumentTask = (document: DocumentCommitDto) => {
    if (!documentTask) return
    documentTask.onResolve(document)
    setDocumentTask(null)
  }

  const state: DocumentContextState = {
    documentTask,
    setDocumentTask,
    resolveDocumentTask: commitDocumentTask,
    rejectDocumentTask,
  }

  return <DocumentContext.Provider value={state}>{children}</DocumentContext.Provider>
}

export { DocumentProvider }
