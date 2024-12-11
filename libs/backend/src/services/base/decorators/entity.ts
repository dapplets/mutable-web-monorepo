import 'reflect-metadata/lite'

const Key = Symbol('entity')

export type EntityMetadata = { name: string; versioned?: boolean }

export function Entity(options: EntityMetadata) {
  return Reflect.metadata(Key, options)
}

export function getEntity(target: Function): EntityMetadata {
  return Reflect.getMetadata(Key, target)
}
