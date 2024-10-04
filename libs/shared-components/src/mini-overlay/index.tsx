import { AppWithSettings, MutationDto } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import React, { FC, ReactElement, useState, useRef, useEffect } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from '../common/image'
import { IWalletConnect } from './types'
import { Drawer } from 'antd'
import OverlayWrapper from './overlay-wrapper'
import { MutationFallbackIcon, StopTopIcon, PlayCenterIcon, StopCenterIcon } from './assets/icons'
import { NotificationProvider } from '@mweb/engine'
import SidePanel from './side-panel'

const WrapperDriver = styled.div<{ $isOpen: boolean }>`
  display: block;
  position: relative;

  .sideWrapper {
    z-index: 6000;
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
    width: 58px;

    .ant-drawer-body {
      overflow: visible;
      padding: 0;
      width: 58px;
    }
  }
`

const MutationIconWrapper = styled.button<{ $isStopped?: boolean; $isButton: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  outline: none;
  border: none;
  background: #fff;
  padding: 0;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
  position: relative;
  box-shadow: 0 4px 5px 0 rgba(45, 52, 60, 0.2);
  cursor: ${(props) => (props.$isButton ? 'pointer' : 'default !important')};

  .labelAppCenter {
    opacity: 0;
  }

  img {
    box-sizing: border-box;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    filter: ${(props) => (props.$isStopped ? 'grayscale(1)' : 'grayscale(0)')};
    transition: all 0.15s ease-in-out;
  }

  &:hover {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(115%)' : 'none')};
    }
  }

  &:active {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(125%)' : 'none')};
    }
  }

  &:hover .labelAppTop {
    opacity: ${(props) => (props.$isStopped ? '0' : '1')};
  }

  &:hover .labelAppCenter {
    opacity: 1;
  }
`

const Loading = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 46px;
  height: 46px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #fff;
  opacity: 0.8;
`

const LabelAppCenter = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 23px;
  height: 23px;
  cursor: pointer;
  box-sizing: border-box;
`

const LabelAppTop = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  cursor: pointer;
`

interface IMutationAppsControl {
  enableApp: () => Promise<void>
  disableApp: () => Promise<void>
  isLoading: boolean
}

interface IAppSwitcherProps extends IMutationAppsControl {
  app: AppWithSettings
}

interface IMiniOverlayProps extends Partial<IWalletConnect> {
  baseMutation: MutationDto | null
  mutationApps: AppWithSettings[]
  children: ReactElement
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}

export const AppSwitcher: FC<IAppSwitcherProps> = ({ app, enableApp, disableApp, isLoading }) => (
  <>
    {isLoading ? (
      <Loading>
        <Spinner animation="border" variant="primary"></Spinner>
      </Loading>
    ) : (
      <MutationIconWrapper
        title={app.localId}
        $isStopped={!app.settings.isEnabled}
        $isButton={true}
      >
        {app?.metadata.image ? <Image image={app?.metadata.image} /> : <MutationFallbackIcon />}

        {!app.settings.isEnabled ? (
          <LabelAppTop className="labelAppTop">
            <StopTopIcon />
          </LabelAppTop>
        ) : null}

        {app.settings.isEnabled ? (
          <LabelAppCenter className="labelAppCenter" onClick={disableApp}>
            <StopCenterIcon />
          </LabelAppCenter>
        ) : (
          <LabelAppCenter className="labelAppCenter" onClick={enableApp}>
            <PlayCenterIcon />
          </LabelAppCenter>
        )}
      </MutationIconWrapper>
    )}
  </>
)

export const MiniOverlay: FC<IMiniOverlayProps> = ({
  baseMutation,
  mutationApps,
  connectWallet,
  disconnectWallet,
  nearNetwork,
  children,
  trackingRefs,
}) => {
  const loggedInAccountId: string = useAccountId() // ToDo: check type
  const overlayRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <WrapperDriver $isOpen={open} ref={overlayRef}>
      <NotificationProvider recipientId={loggedInAccountId}>
        <Drawer
          classNames={{
            wrapper: 'sideWrapper',
            content: 'sideContent',
          }}
          open
          style={{ boxShadow: 'none', background: 'none' }}
          mask={false}
          rootStyle={{ boxShadow: 'none', background: 'none' }}
          getContainer={() => {
            if (!overlayRef.current) return
            return overlayRef.current as any
          }}
        >
          <SidePanel
            baseMutation={baseMutation}
            mutationApps={mutationApps}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            nearNetwork={nearNetwork}
            overlayRef={overlayRef}
            loggedInAccountId={loggedInAccountId}
            trackingRefs={trackingRefs}
            isNotificationPageOpen={open}
            openCloseNotificationPage={setOpen}
          >
            {children}
          </SidePanel>
        </Drawer>

        <OverlayWrapper
          apps={mutationApps.length > 0}
          onClose={() => setOpen(false)}
          open={open}
          connectWallet={connectWallet}
          loggedInAccountId={loggedInAccountId}
          modalContainerRef={overlayRef}
        />
      </NotificationProvider>
    </WrapperDriver>
  )
}
