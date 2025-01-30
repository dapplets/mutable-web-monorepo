import { Engine, EngineConfig } from '@mweb/backend'
import { CoreProvider } from '@mweb/react'
import { EngineProvider } from '@mweb/react-engine'
import React, { FC, Fragment, ReactNode, useRef, useState } from 'react'
import { ContextHighlighter } from './components/context-highlighter'
import { ContextManager } from './components/context-manager'
import { ContextPicker } from './components/context-picker'
import { DevProvider } from './contexts/dev-context'
import { HighlighterProvider } from './contexts/highlighter-context'
import { ModalProvider } from './contexts/modal-context'
import { ModalContextState } from './contexts/modal-context/modal-context'
import { MutableWebProvider } from './contexts/mutable-web-context'
import { PickerProvider } from './contexts/picker-context'
import { PortalProvider } from './contexts/portal-context'
import { ViewportProvider } from './contexts/viewport-context'
import { Core } from '@mweb/core'

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

  const coreRef = useRef<Core | null>(null)
  if (!coreRef.current) {
    coreRef.current = new Core()
  }

  const engineRef = useRef<Engine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new Engine(config)
    console.log('[MutableWeb] Engine initialized', engineRef.current)
  }

  return (
    <CoreProvider core={coreRef.current}>
      <EngineProvider engine={engineRef.current}>
        <DevProvider devServerUrl={devServerUrl}>
          <PortalProvider>
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
          </PortalProvider>
        </DevProvider>
      </EngineProvider>
    </CoreProvider>
  )
}
