import { DocumentId } from '../document/document.entity'
import { ParserConfigId } from '../parser-config/parser-config.entity'
import { Target } from '../target/target.entity'

export type AppId = string

export const AnyParserValue = 'any'

export type AppMetadataTarget = Target & {
  static?: boolean
  componentId: string
  injectTo: string
  injectOnce?: boolean
}

export type AppMetadata = {
  id: AppId
  authorId: string
  appLocalId: string
  targets: AppMetadataTarget[]
  parsers?: typeof AnyParserValue | ParserConfigId[]
  controller?: string // BOS Widget ID
  metadata: {
    name?: string
    description?: string
    image?: {
      ipfs_cid?: string
    }
  }
  permissions: {
    documents: boolean
  }
}

export type AppWithSettings = AppMetadata & {
  settings: {
    isEnabled: boolean
  }
}

export type AppInstanceWithSettings = AppWithSettings & {
  instanceId: string
  documentId: DocumentId | null
}
