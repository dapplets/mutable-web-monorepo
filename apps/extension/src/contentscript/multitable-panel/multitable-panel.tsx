import { useMutableWeb } from '@mweb/engine'
import { EngineProvider, UberSausage } from '@mweb/shared-components'
import React, { FC } from 'react'
import { useConnectWallet, useDisconnectWallet, useWallet } from '../../common/wallet-context'
import { useWallet as useEthWallet, useConnectEthWallet } from '../../common/wallet-ethereum'
import { useSidePanel } from '../hooks/use-side-panel'
import styled from 'styled-components'
import Background from '../../common/background'

// ToDo: imitation of behavior of AntDesign's Drawer
const UberSausageWrapper = styled.div`
  z-index: 1010; // over the drawer's shadow (1000) and NearSocial's navbar (900), under overlay mask (2030)
  right: 0;
  top: 68px;
  position: fixed;
`

export const MultitablePanel: FC = () => {
  useSidePanel()

  const { accountId, networkId } = useWallet()
  const { address, addresses, walletChainId } = useEthWallet()
  const { connectWallet: connectEthWallet } = useConnectEthWallet()
  const { connectWallet } = useConnectWallet()
  const { disconnectWallet } = useDisconnectWallet()
  const { tree } = useMutableWeb()

  const handleToggleOverlay = () => {
    Background.toggleSidePanel()
  }

  return (
    <>
      <EngineProvider
        tree={tree}
        loggedInAccountId={accountId}
        nearNetwork={networkId}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
        onConnectEthWallet={connectEthWallet}
        address={address}
        addresses={addresses}
        walletChainId={walletChainId}
      >
        <UberSausageWrapper>
          <UberSausage onToggleOverlay={handleToggleOverlay} />
        </UberSausageWrapper>
      </EngineProvider>
    </>
  )
}

export default MultitablePanel
