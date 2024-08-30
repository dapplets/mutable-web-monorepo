import { Value } from '../social-db/social-db.service'

export type LinkIndexRules = {
  namespace?: boolean
  type?: boolean
  parsed: Record<string, boolean>
  parent?: LinkIndexRules
}

export type IndexedContext = {
  namespace?: string
  type?: string
  parsed?: Record<string, Value>
  parent?: IndexedContext
}

export type IndexObject = {
  appId: string
  documentId?: string
  mutationId: string
  context: IndexedContext
}

export type LinkedDataByAccount = { [accountId: string]: any }
