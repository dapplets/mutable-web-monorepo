import { AppWithSettings, MutationDto } from '@mweb/backend'
import { NotificationProvider, useMutableWeb } from '@mweb/engine'
import { Drawer } from 'antd'
import React, { FC, ReactElement, useRef } from 'react'
import { MemoryRouter } from 'react-router'
import styled from 'styled-components'
import OverlayWrapper from './overlay-wrapper'
import { SidePanel } from './side-panel'
import { IWalletConnect } from './types'
import UberSausage from './uber-sausage'

const WrapperDriver = styled.div<{ $isOpen: boolean }>`
  display: block;
  position: relative;
  border: none;
  z-index: 5000;

  .sideWrapper {
    box-shadow: none;
    width: min-content !important;
    top: 10px;
    transition: all 0.2s ease-in-out;
    transform: ${(props) => (props.$isOpen ? 'translateX(-360px)' : 'translateX(0)')};

    .ant-drawer-header-close-only {
      display: none;
    }
  }

  .sideContent {
    position: relative;
    overflow: visible;
    padding: 0;

    .ant-drawer-body {
      overflow: visible;
      padding: 0;
      width: 58px;
      direction: rtl;
    }
  }
`

interface IMiniOverlayProps extends IWalletConnect {
  loggedInAccountId: string | null
  baseMutation: MutationDto | null
  mutationApps: AppWithSettings[]
  children: ReactElement
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  open: boolean
  onMutateButtonClick: () => void
}

export const MiniOverlay: FC<IMiniOverlayProps> = ({
  baseMutation,
  mutationApps,
  onConnectWallet: connectWallet,
  onDisconnectWallet: disconnectWallet,
  loggedInAccountId,
  nearNetwork,
  children,
  trackingRefs,
  setOpen,
  open,
  onMutateButtonClick: handleMutateButtonClick,
}) => {
  // ToDo: check type
  const overlayRef = useRef<HTMLDivElement>(null)
  const { engine } = useMutableWeb()

  const handleCloseOverlay = () => {
    setOpen(false)
  }

  return (
    <MemoryRouter>
      <WrapperDriver $isOpen={open} ref={overlayRef}>
        <NotificationProvider engine={engine} recipientId={loggedInAccountId}>
          <Drawer
            classNames={{
              wrapper: 'sideWrapper',
              content: 'sideContent',
            }}
            open
            style={{ boxShadow: 'none', background: 'none', border: 'none', outline: 'none' }}
            mask={false}
            rootStyle={{ boxShadow: 'none', background: 'none', border: 'none', outline: 'none' }}
            getContainer={() => {
              if (!overlayRef.current) return
              return overlayRef.current as any
            }}
          >
            <UberSausage
              baseMutation={baseMutation}
              mutationApps={mutationApps}
              onConnectWallet={connectWallet}
              onDisconnectWallet={disconnectWallet}
              nearNetwork={nearNetwork}
              overlayRef={overlayRef}
              loggedInAccountId={loggedInAccountId}
              trackingRefs={trackingRefs}
              isOverlayOpened={open}
              openOverlay={setOpen}
            >
              {children}
            </UberSausage>
          </Drawer>

          <OverlayWrapper apps={mutationApps.length > 0} onClose={handleCloseOverlay} open={open}>
            <SidePanel
              loggedInAccountId={loggedInAccountId}
              nearNetwork={nearNetwork}
              trackingRefs={trackingRefs}
              overlayRef={overlayRef}
              onCloseOverlay={handleCloseOverlay}
              onMutateButtonClick={handleMutateButtonClick}
              onConnectWallet={connectWallet}
              onDisconnectWallet={disconnectWallet}
            />
          </OverlayWrapper>
        </NotificationProvider>
      </WrapperDriver>
    </MemoryRouter>
  )
}
