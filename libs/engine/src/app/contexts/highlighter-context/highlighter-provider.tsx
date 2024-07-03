import React, { FC, useState, ReactNode } from 'react'

import {
  THighlighterTask,
  THighlighterContextState,
  HighlighterContext,
} from './highlighter-context'

export const HighlighterProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [highlighterTask, setHighlighterTask] = useState<THighlighterTask | null>(null)

  const state: THighlighterContextState = {
    highlighterTask,
    setHighlighterTask,
  }

  return <HighlighterContext.Provider value={state}>{children}</HighlighterContext.Provider>
}
