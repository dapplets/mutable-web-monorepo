import { BosParserConfig, JsonParserConfig, ParserType } from '@mweb/core'
import { Target } from '../target/target.entity'
import { Entity } from '../base/decorators/entity'
import { Column, ColumnType } from '../base/decorators/column'
import { Base, EntityId } from '../base/base.entity'

export type ParserConfigId = EntityId

@Entity({ name: 'parser' })
export class ParserConfig extends Base {
  @Column()
  parserType: ParserType = ParserType.Unknown

  @Column({ type: ColumnType.Json })
  targets: Target[] = []

  @Column({ type: ColumnType.Json })
  contexts: JsonParserConfig | BosParserConfig | null = null
}
