import { EntityMetadata } from '../../../common/entity-metadata'
import { BaseDto } from '../../base/base.dto'
import { ParserConfigId } from '../../parser-config/parser-config.entity'
import { AnyParserValue, AppId, AppMetadataTarget } from '../application.entity'

export type ApplicationDto = BaseDto & {
  metadata: EntityMetadata<AppId>
  targets: AppMetadataTarget[]
  parsers: typeof AnyParserValue | ParserConfigId[] | null
  controller: string | null
  permissions: {
    documents: boolean
  }
}
