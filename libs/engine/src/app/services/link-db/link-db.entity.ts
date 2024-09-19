import { Base } from '../base/base.entity'
import { Column, ColumnType } from '../base/decorators/column'
import { Entity } from '../base/decorators/entity'
import { Value } from '../social-db/social-db.service'

export type LinkIndexRules = {
  namespace?: boolean
  type?: boolean
  parsed: Record<string, boolean>
  parent?: LinkIndexRules
}

export type IndexedContext = {
  namespace?: string
  type?: string
  parsed?: Record<string, Value>
  parent?: IndexedContext
}

export type IndexObject = {
  appId?: string
  documentId?: string
  mutationId?: string
  context?: IndexedContext
}

export type LinkedDataByAccountDto = { [accountId: string]: any }

@Entity({ name: 'ctxlink' })
export class CtxLink extends Base {
  @Column({ type: ColumnType.Json })
  data: any = {}

  @Column()
  index: IndexObject = {}
}
