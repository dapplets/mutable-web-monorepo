import { EntityMetadata } from '../../../common/entity-metadata'
import { BaseCreateDto } from '../../base/base-create.dto'
import { Target } from '../../target/target.entity'
import { AppInMutation, Mutation, MutationId } from '../mutation.entity'

export type MutationCreateDto = BaseCreateDto & {
  metadata: EntityMetadata<MutationId>
  apps: AppInMutation[]
  targets: Target[]
}
