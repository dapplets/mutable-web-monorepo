import React from 'react'
import { SidePanel } from '@mweb/shared-components'

export const App: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <SidePanel
      nearNetwork={'testnet'}
      loggedInAccountId={'dapplets.testnet'}
      onDisconnectWallet={() => Promise.resolve()}
      onConnectWallet={() => Promise.resolve()}
      onMutateButtonClick={() => {}}
      onCloseOverlay={() => {}}
      trackingRefs={new Set()}
      overlayRef={ref}
    />
  )
}
