import React, { ReactElement, Fragment, ReactNode } from 'react'
import { FC } from 'react'
import { CoreProvider } from '@mweb/react'
import { EngineConfig } from '../engine'
import { EngineProvider } from './contexts/engine-context'
import { MutableWebProvider } from './contexts/mutable-web-context'
import { ViewportProvider } from './contexts/viewport-context'
import { ContextPicker } from './components/context-picker'
import { ContextManager } from './components/context-manager'
import { ModalProvider } from './contexts/modal-context'
import { PickerProvider } from './contexts/picker-context'
import { ContextHighlighter } from './components/context-highlighter'
import { HighlighterProvider } from './contexts/highlighter-context'

export const App: FC<{
  config: EngineConfig
  defaultMutationId?: string | null
  devServerUrl?: string | null
  children?: ReactNode
}> = ({ config, defaultMutationId, devServerUrl, children }) => {
  return (
    <ViewportProvider stylesheetSrc={config.bosElementStyleSrc}>
      <ModalProvider>
        <CoreProvider>
          <EngineProvider devServerUrl={devServerUrl}>
            <PickerProvider>
              <HighlighterProvider>
                <MutableWebProvider config={config} defaultMutationId={defaultMutationId}>
                  <ContextPicker />
                  <ContextManager />
                  <ContextHighlighter />
                  <Fragment>{children}</Fragment>
                </MutableWebProvider>
              </HighlighterProvider>
            </PickerProvider>
          </EngineProvider>
        </CoreProvider>
      </ModalProvider>
    </ViewportProvider>
  )
}
