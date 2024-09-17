import 'reflect-metadata/lite'

const Key = Symbol('column')

export enum ColumnType {
  Json = 'json',
  AsIs = 'asis',
}

export type TargetMetadata = {
  type: ColumnType
  transformer?: {
    from?: (item: any) => any
    to?: (item: any) => any
  }
}

export function Column(options: TargetMetadata = { type: ColumnType.AsIs }) {
  return Reflect.metadata(Key, options)
}

export function getColumn(target: any, propertyKey: string): TargetMetadata {
  return Reflect.getMetadata(Key, target, propertyKey)
}
