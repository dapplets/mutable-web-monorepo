import { EntityMetadata } from '../../common/entity-metadata'
import { AppId } from '../application/application.entity'
import { Entity } from '../base/decorators/entity'
import { Base, EntityId } from '../base/base.entity'
import { Column, ColumnType } from '../base/decorators/column'
import { DocumentDto } from './dtos/document.dto'

export type DocumentId = EntityId

export type DocumentMetadata = EntityMetadata<DocumentId>

@Entity({ name: 'document' })
export class Document extends Base {
  @Column()
  metadata: DocumentMetadata = {}

  @Column({ name: 'open_with', type: ColumnType.Set })
  openWith: AppId[] = []

  toDto(): DocumentDto {
    return {
      ...super.toDto(),
      metadata: this.metadata,
      openWith: this.openWith,
    }
  }
}
