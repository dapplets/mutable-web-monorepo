import { EntityMetadata } from '../../common/entity-metadata'
import { DocumentId } from '../document/document.entity'
import { ParserConfigId } from '../parser-config/parser-config.entity'
import { Target } from '../target/target.entity'

export type AppId = string
export type AppInstanceId = string

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
  metadata: EntityMetadata<AppId>
  permissions: {
    documents: boolean
  }
}

export type AppInstanceSettings = {
  isEnabled: boolean
}

export type AppWithSettings = AppMetadata & {
  settings: AppInstanceSettings
}

export type AppInstanceWithSettings = AppWithSettings & {
  instanceId: string
  documentId: DocumentId | null
}
