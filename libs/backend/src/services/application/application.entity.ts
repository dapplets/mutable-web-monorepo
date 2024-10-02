import { EntityMetadata } from '../../common/entity-metadata'
import { Base, EntityId } from '../base/base.entity'
import { Column, ColumnType } from '../base/decorators/column'
import { Entity } from '../base/decorators/entity'
import { DocumentId } from '../document/document.entity'
import { ParserConfigId } from '../parser-config/parser-config.entity'
import { Target } from '../target/target.entity'
import { ApplicationDto } from './dtos/application.dto'

export type AppId = EntityId
export type AppInstanceId = string

export const AnyParserValue = 'any'

export type AppMetadataTarget = Target & {
  static?: boolean
  componentId: string
  injectTo: string
  injectOnce?: boolean
}

@Entity({ name: 'app' })
export class AppMetadata extends Base {
  @Column()
  metadata: EntityMetadata<AppId> = {}

  @Column({ type: ColumnType.Json })
  targets: AppMetadataTarget[] = []

  @Column({ type: ColumnType.Json })
  parsers: typeof AnyParserValue | ParserConfigId[] | null = null

  @Column()
  controller: string | null = null // BOS Widget ID

  @Column({ type: ColumnType.Json })
  permissions: {
    documents: boolean
  } = {
    documents: false,
  }

  toDto(): ApplicationDto {
    return {
      ...super.toDto(),
      metadata: this.metadata,
      targets: this.targets,
      parsers: this.parsers,
      controller: this.controller,
      permissions: this.permissions,
    }
  }
}

export type AppInstanceSettings = {
  isEnabled: boolean
}

export type AppWithSettings = ApplicationDto & {
  settings: AppInstanceSettings
}

export type AppInstanceWithSettings = AppWithSettings & {
  instanceId: string
  documentId: DocumentId | null
}
