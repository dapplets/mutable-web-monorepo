import { AppId } from '../application/application.entity'
import { DocumentId } from '../document/document.entity'
import { Target } from '../target/target.entity'
import { EntityMetadata } from '../../common/entity-metadata'

export type MutationId = string

export type AppInMutation = {
  appId: AppId
  documentId: DocumentId | null
}

export type Mutation = {
  id: MutationId
  metadata: EntityMetadata<MutationId>
  apps: AppInMutation[]
  targets: Target[]
}

export type MutationWithSettings = Mutation & {
  settings: {
    lastUsage: string | null
  }
}
