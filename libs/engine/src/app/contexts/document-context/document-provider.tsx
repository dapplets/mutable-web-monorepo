import React, { FC, ReactElement, useEffect } from 'react'
import { DocumentContext, DocumentContextState, DocumentTask } from './document-context'

type Props = {
  children?: ReactElement
}

const DocumentProvider: FC<Props> = ({ children }) => {
  const [documentTask, setDocumentTask] = React.useState<DocumentTask | null>(null)
  const state: DocumentContextState = {
    documentTask,
    setDocumentTask,
  }

  return <DocumentContext.Provider value={state}>{children}</DocumentContext.Provider>
}

export { DocumentProvider }
