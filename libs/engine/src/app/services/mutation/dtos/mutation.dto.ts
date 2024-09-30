import { BaseDto } from '../../base/base.dto'
import { AppInMutation, Mutation, MutationId } from '../mutation.entity'
import { EntityMetadata } from '../../../common/entity-metadata'
import { Target } from '../../target/target.entity'

export type MutationDto = BaseDto & {
  metadata: EntityMetadata<MutationId>
  apps: AppInMutation[]
  targets: Target[]
}

export const toMutationDto = (mutation: Mutation): MutationDto => {
  return {
    id: mutation.id,
    localId: mutation.localId,
    authorId: mutation.authorId,
    blockNumber: mutation.blockNumber,
    timestamp: mutation.timestamp,
    metadata: mutation.metadata,
    apps: mutation.apps,
    targets: mutation.targets,
  }
}
