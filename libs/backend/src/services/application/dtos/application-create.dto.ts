import { EntityMetadata } from '../../../common/entity-metadata'
import { BaseCreateDto } from '../../base/base-create.dto'
import { ParserConfigId } from '../../parser-config/parser-config.entity'
import { AnyParserValue, AppId, AppMetadataTarget } from '../application.entity'

export type ApplicationCreateDto = BaseCreateDto & {
  metadata: EntityMetadata<AppId>
  targets: AppMetadataTarget[]
  parsers: typeof AnyParserValue | ParserConfigId[] | null
  controller: string | null
  permissions: {
    documents: boolean
  }
}
