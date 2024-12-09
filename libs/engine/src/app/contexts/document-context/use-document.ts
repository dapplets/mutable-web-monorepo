import { useContext } from 'react'
import { DocumentContext } from './document-context'

export function useDocument() {
  return useContext(DocumentContext)
}
