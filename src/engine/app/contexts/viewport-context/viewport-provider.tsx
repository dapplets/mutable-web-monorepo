import React, { FC, ReactNode } from 'react'
import { ViewportContext, ViewportContextState } from './viewport-context'
import { ShadowDomWrapper } from '../../../bos/shadow-dom-wrapper'

type Props = {
  children?: ReactNode
  stylesheetSrc?: string
}

const ViewportProvider: FC<Props> = ({ children, stylesheetSrc }) => {
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const state: ViewportContextState = {
    viewportRef,
  }

  return (
    <ViewportContext.Provider value={state}>
      <ShadowDomWrapper ref={viewportRef} stylesheetSrc={stylesheetSrc}>
        <>{children}</>
      </ShadowDomWrapper>
    </ViewportContext.Provider>
  )
}

export { ViewportProvider }
