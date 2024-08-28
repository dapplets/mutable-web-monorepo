import { AppId } from '../application/application.entity'

export type DocumentId = string

export type DocumentMetadata = {
  name?: string
  description?: string
  image?: {
    ipfs_cid?: string
  }
}

export type Document = {
  id: DocumentId
  metadata: DocumentMetadata
  openWith: AppId[]
  authorId: string
  documentLocalId: string
}
