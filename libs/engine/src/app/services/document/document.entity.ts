import { EntityMetadata } from '../../common/entity-metadata'
import { AppId } from '../application/application.entity'

export type DocumentId = string

export type DocumentMetadata = EntityMetadata<DocumentId>

export type Document = {
  id: DocumentId
  metadata: DocumentMetadata
  openWith: AppId[]
  authorId: string
  documentLocalId: string
}
