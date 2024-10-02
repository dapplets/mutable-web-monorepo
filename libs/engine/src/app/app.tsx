import React, { ReactElement, Fragment, ReactNode, useState } from 'react'
import { FC } from 'react'
import { CoreProvider } from '@mweb/react'
import { EngineConfig } from '@mweb/backend'
import { EngineProvider } from './contexts/engine-context'
import { MutableWebProvider } from './contexts/mutable-web-context'
import { ViewportProvider } from './contexts/viewport-context'
import { ContextPicker } from './components/context-picker'
import { ContextManager } from './components/context-manager'
import { ModalProvider } from './contexts/modal-context'
import { PickerProvider } from './contexts/picker-context'
import { ContextHighlighter } from './components/context-highlighter'
import { HighlighterProvider } from './contexts/highlighter-context'
import { ModalContextState } from './contexts/modal-context/modal-context'

export const App: FC<{
  config: EngineConfig
  defaultMutationId?: string | null
  devServerUrl?: string | null
  children?: ReactNode
}> = ({ config, defaultMutationId, devServerUrl, children }) => {
  // ToDo: hack to make modal context available outside of its provider
  // children should be outside of ViewportProvider, but MutableWebProvider should be inside it
  const [modalApi, setModalApi] = useState<ModalContextState>({
    notify: () => console.log('notify'),
  })

  return (
    <CoreProvider>
      <EngineProvider devServerUrl={devServerUrl}>
        <PickerProvider>
          <HighlighterProvider>
            <MutableWebProvider
              config={config}
              defaultMutationId={defaultMutationId}
              modalApi={modalApi}
            >
              <ViewportProvider stylesheetSrc={config.bosElementStyleSrc}>
                <ModalProvider onModalApiReady={setModalApi}>
                  <ContextPicker />
                  <ContextManager />
                  <ContextHighlighter />
                </ModalProvider>
              </ViewportProvider>
              <Fragment>{children}</Fragment>
            </MutableWebProvider>
          </HighlighterProvider>
        </PickerProvider>
      </EngineProvider>
    </CoreProvider>
  )
}
