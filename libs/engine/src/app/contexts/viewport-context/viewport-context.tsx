import { createContext } from 'react'

export type ViewportContextState = {
  viewportRef: React.RefObject<HTMLDivElement>
}

export const contextDefaultValues: ViewportContextState = {
  viewportRef: null as any as React.RefObject<HTMLDivElement>,
}

export const ViewportContext = createContext<ViewportContextState>(contextDefaultValues)
