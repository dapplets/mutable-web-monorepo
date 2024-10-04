import { AppId } from '../application/application.entity'
import { Base, EntityId } from '../base/base.entity'
import { Column, ColumnType } from '../base/decorators/column'
import { Entity } from '../base/decorators/entity'
import { MutationId } from '../mutation/mutation.entity'
import { ScalarType } from '../target/target.entity'

export type UserLinkId = EntityId

export type LinkIndex = string

@Entity({ name: 'link' })
export class IndexedLink extends Base {
  @Column({ type: ColumnType.Set })
  indexes: string[] = []
}

export type LinkIndexObject = {
  appId: AppId
  mutationId: MutationId

  // context related fields
  namespace: string
  contextType: string
  if: Record<string, ScalarType> // similar like Target but with ScalarType instead of TargetCondition
}

export type BosUserLink = {
  id: UserLinkId
  appId: AppId
  namespace: string
  insertionPoint: string
  bosWidgetId: string
  authorId: string
  static: boolean
  // ToDo: add props
}

export type BosUserLinkWithInstance = BosUserLink & {
  appInstanceId: string
}

export type ControllerLink = {
  id: string
  appId: AppId
  appInstanceId: string
  bosWidgetId: string
}
