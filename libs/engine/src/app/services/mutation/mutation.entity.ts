import { AppId } from '../application/application.entity'
import { DocumentId } from '../document/document.entity'
import { Target } from '../target/target.entity'

export type MutationId = string

export type AppInMutation = {
  appId: AppId
  documentId: DocumentId | null
}

export type Mutation = {
  id: MutationId
  metadata: {
    name?: string
    description?: string
    image?: {
      ipfs_cid?: string
    }
  }
  apps: AppInMutation[]
  targets: Target[]
}

export type MutationWithSettings = Mutation & {
  settings: {
    lastUsage: string | null
  }
}
