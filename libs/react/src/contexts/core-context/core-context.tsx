import { Core, IContextNode, ParserConfig } from '@mweb/core'
import { createContext } from 'react'

export type CoreContextState = {
  core: Core
  tree: IContextNode | null
  attachParserConfig: (parserConfig: ParserConfig) => void
  detachParserConfig: (parserId: string) => void
  updateRootContext: (rootParsedContext: any) => void
}

export const contextDefaultValues: CoreContextState = {
  core: null as any as Core,
  tree: null,
  attachParserConfig: () => undefined,
  detachParserConfig: () => undefined,
  updateRootContext: () => undefined,
}

export const CoreContext = createContext<CoreContextState>(contextDefaultValues)
