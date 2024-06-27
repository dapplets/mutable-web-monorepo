import React, { ReactElement } from 'react'
import { FC } from 'react'
import { CoreProvider } from '../../react'
import { StyleSheetManager } from 'styled-components'
import { EngineConfig } from '../engine'
import { EngineProvider } from './contexts/engine-context'
import { MutableWebProvider } from './contexts/mutable-web-context'
import { ViewportProvider } from './contexts/viewport-context'
import { ContextPicker } from './components/context-picker'
import { ContextManager } from './components/context-manager'
import { PickerProvider } from './contexts/picker-context'

export const App: FC<{
  config: EngineConfig
  defaultMutationId?: string | null
  stylesMountPoint: HTMLElement
  children?: ReactElement
}> = ({ config, defaultMutationId, stylesMountPoint, children }) => {
  return (
    <StyleSheetManager target={stylesMountPoint}>
      <CoreProvider>
        <EngineProvider>
          <PickerProvider>
            <MutableWebProvider config={config} defaultMutationId={defaultMutationId}>
              <ViewportProvider stylesheetSrc={config.bosElementStyleSrc}>
                <ContextPicker />
                <ContextManager />
              </ViewportProvider>
              <React.Fragment>{children}</React.Fragment>
            </MutableWebProvider>
          </PickerProvider>
        </EngineProvider>
      </CoreProvider>
    </StyleSheetManager>
  )
}
