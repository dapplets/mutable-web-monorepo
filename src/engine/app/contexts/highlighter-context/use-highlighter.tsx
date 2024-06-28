import { useContext } from 'react'

import { HighlighterContext } from './highlighter-context'

export function useHighlighter() {
  return useContext(HighlighterContext)
}
