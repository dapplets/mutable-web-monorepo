export type EntityMetadata<EntityIdType> = {
  name?: string
  description?: string
  image?: {
    ipfs_cid?: string
  }
  fork_of?: EntityIdType
}
