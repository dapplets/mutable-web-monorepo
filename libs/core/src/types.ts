import { BosParserConfig } from './parsers/bos-parser'
import { JsonParserConfig } from './parsers/json-parser'

export enum ParserType {
  Bos = 'bos',
  Microdata = 'microdata',
  Json = 'json',
  MWeb = 'mweb',
  Link = 'link',
  Unknown = 'unknown',
}

export type ParserConfig = {
  id: string
  parserType: ParserType
  contexts?: JsonParserConfig | BosParserConfig | null
}
