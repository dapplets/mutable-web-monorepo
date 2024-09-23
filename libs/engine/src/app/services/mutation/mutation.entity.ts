import { AppId } from '../application/application.entity'
import { DocumentId } from '../document/document.entity'
import { Target } from '../target/target.entity'
import { EntityMetadata } from '../../common/entity-metadata'
import { Base } from '../base/base.entity'
import { Column, ColumnType } from '../base/decorators/column'
import { Entity } from '../base/decorators/entity'

export type MutationId = string

export type AppInMutation = {
  appId: AppId
  documentId: DocumentId | null
}

@Entity({ name: 'mutation' })
export class Mutation extends Base {
  @Column()
  metadata: EntityMetadata<MutationId> = {}

  @Column({ type: ColumnType.Json, transformer: { from: normalizeApps, to: denormalizeApps } })
  apps: AppInMutation[] = []

  @Column({ type: ColumnType.Json })
  targets: Target[] = []
}

export type MutationWithSettings = Mutation & {
  settings: {
    lastUsage: string | null
  }
}

function normalizeApps(apps: any): AppInMutation[] {
  return apps.map((app: any) => (typeof app === 'string' ? { appId: app, documentId: null } : app))
}

function denormalizeApps(apps: AppInMutation[]): any {
  return apps.map((app) => (app.documentId ? app : app.appId))
}
