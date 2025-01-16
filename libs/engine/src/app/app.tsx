import React, { Fragment, ReactNode, useRef, useState } from 'react'
import { FC } from 'react'
import { CoreProvider, useCore } from '@mweb/react'
import { Engine, EngineConfig } from '@mweb/backend'
import { EngineProvider } from '@mweb/react-engine'
import { DevProvider } from './contexts/dev-context'
import { PortalProvider } from './contexts/portal-context'
import { MutableWebProvider } from './contexts/mutable-web-context'
import { ViewportProvider } from './contexts/viewport-context'
import { ContextPicker } from './components/context-picker'
import { ContextManager } from './components/context-manager'
import { ModalProvider } from './contexts/modal-context'
import { PickerProvider } from './contexts/picker-context'
import { ContextHighlighter } from './components/context-highlighter'
import { HighlighterProvider } from './contexts/highlighter-context'
import { ModalContextState } from './contexts/modal-context/modal-context'
import { ConnectedAccountsProvider } from './contexts/connected-accounts-context'
import { ParserConfig, ParserType } from '@mweb/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const InitialParserConfigs: ParserConfig[] = [
  {
    parserType: ParserType.MWeb,
    id: 'mweb',
  },
  {
    parserType: ParserType.Link,
    id: 'engine', // ToDo: id used as namespace
  },
]

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
  const engineRef = useRef<Engine | null>(null)

  if (!engineRef.current) {
    engineRef.current = new Engine(config)

    console.log('[MutableWeb] Engine initialized', engineRef.current)
  }

  return (
    <CoreProvider initialParserConfigs={InitialParserConfigs}>
      <QueryClientProvider client={queryClient}>
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
                    <ConnectedAccountsProvider>
                      <ViewportProvider stylesheetSrc={config.bosElementStyleSrc}>
                        <ModalProvider onModalApiReady={setModalApi}>
                          <ContextPicker />
                          <ContextManager />
                          <ContextHighlighter />
                        </ModalProvider>
                      </ViewportProvider>
                      <Fragment>{children}</Fragment>
                    </ConnectedAccountsProvider>
                  </MutableWebProvider>
                </HighlighterProvider>
              </PickerProvider>
            </PortalProvider>
          </DevProvider>
        </EngineProvider>
      </QueryClientProvider>
    </CoreProvider>
  )
}
