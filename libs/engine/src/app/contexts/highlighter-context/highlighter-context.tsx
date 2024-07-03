import React, { createContext, ReactElement } from 'react'
import { InjectableTarget } from '../engine-context/engine-context'

export type THighlighterTask = {
  target: InjectableTarget
  styles?: React.CSSProperties
  isFilled?: boolean
  icon?: ReactElement
  action?: () => void
}

export type THighlighterContextState = {
  highlighterTask: THighlighterTask | null
  setHighlighterTask: (picker: THighlighterTask | null) => void
}

const contextDefaultValues: THighlighterContextState = {
  highlighterTask: null,
  setHighlighterTask: () => undefined,
}

export const HighlighterContext = createContext<THighlighterContextState>(contextDefaultValues)
