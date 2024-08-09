import { BosParserConfig } from './parsers/bos-parser'
import { JsonParserConfig } from './parsers/json-parser'

export enum AdapterType {
  Bos = 'bos',
  Microdata = 'microdata',
  Json = 'json',
  MWeb = 'mweb',
  Blink = 'blink',
}

export type ParserConfig =
  | ({ parserType: AdapterType.Json; id: string } & JsonParserConfig)
  | ({ parserType: AdapterType.Bos; id: string } & BosParserConfig)
  | { parserType: AdapterType.MWeb; id: string }
  | { parserType: AdapterType.Blink; id: string }
