import { BaseDto } from '../../base/base.dto'
import { AppInMutation, MutationId } from '../mutation.entity'
import { EntityMetadata } from '../../../common/entity-metadata'
import { Target } from '../../target/target.entity'

export type MutationDto = BaseDto & {
  metadata: EntityMetadata<MutationId>
  apps: AppInMutation[]
  targets: Target[]
}
