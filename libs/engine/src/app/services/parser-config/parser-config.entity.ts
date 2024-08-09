import { BosParserConfig, JsonParserConfig } from '@mweb/core'
import { Target } from '../target/target.entity'

export type ParserConfigId = string

export enum AdapterType {
  Bos = 'bos',
  Microdata = 'microdata',
  Json = 'json',
  MWeb = 'mweb',
  Blink = 'blink',
}

export type ParserConfig =
  | ({ parserType: AdapterType.Json; id: ParserConfigId; targets: Target[] } & JsonParserConfig)
  | ({ parserType: AdapterType.Bos; id: ParserConfigId; targets: Target[] } & BosParserConfig)
  | { parserType: AdapterType.MWeb; id: ParserConfigId; targets: Target[] }
  | { parserType: AdapterType.Blink; id: ParserConfigId; targets: Target[] }
