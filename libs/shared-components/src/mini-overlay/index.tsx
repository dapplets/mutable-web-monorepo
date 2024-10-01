import { AppWithSettings, MutationDto } from '@mweb/engine'
import { useAccountId } from 'near-social-vm'
import React, { FC, ReactElement, useState, useRef } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from '../common/Image'
import Profile, { IWalletConnect } from './Profile'
import { Button, Drawer } from 'antd'
import OverlayWrapper from './OverlayWrapper'
import {
  MutationFallbackIcon,
  ArrowIcon,
  StopTopIcon,
  PlayCenterIcon,
  StopCenterIcon,
  BellIcon,
} from './assets/icons'

const WrapperDriver = styled.div<{ $isOpen: boolean }>`
  display: block;
  position: relative;

  .sideWrapper {
    z-index: 6000;
    box-shadow: none;
    width: min-content !important;
    top: 10px;
    transition: all 0.2s;
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

const SidePanelWrapper = styled.div<{ $isApps: boolean }>`
  position: absolute;
  z-index: 6000;
  display: flex;
  width: 58px;
  top: 55px;
  user-select: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px 0px 0px 4px;
  background: ${(props) => (props.$isApps ? '#EEEFF5' : '#F8F9FF')};
  box-shadow: 0 4px 20px 0 rgba(11, 87, 111, 0.15);
  font-family: sans-serif;
  box-sizing: border-box;
`

const TopBlock = styled.div<{ $open?: boolean; $noMutations: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px;
  background: ${(props) => (props.$open ? '#fff' : 'transparent')};
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: ${(props) => (props.$noMutations ? '4px 0 0 4px' : '4px 0 0 0')};
  position: relative;
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

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: content-box !important;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 46px;
  margin-top: 7px;
  padding: 0 5px 5px;
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

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 6px;
  gap: 10px;
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

const ButtonOpenWrapper = styled.div<{ $open?: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 32px;
  background: ${(props) => (props.$open ? '#fff' : 'transparent')};
  padding-left: 6px;
  padding-right: 6px;
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: 0 0 0 4px;

  .svgTransform {
    svg {
      transform: rotate(180deg);
    }
  }
`

const ButtonOpen = styled.button<{ $open?: boolean }>`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 22px;
  outline: none;
  background: transparent;
  border-radius: 4px;
  border: ${(props) => (props.$open ? 'none' : '1px solid #e2e2e5')};
  padding: 0;

  path {
    stroke: #7a818b;
  }

  &:hover {
    background: #fff;

    path {
      stroke: #384bff;
    }
  }

  &:active {
    background: #384bff;

    path {
      stroke: #fff;
    }
  }
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
  trackingRefs = new Set(),
}) => {
  const loggedInAccountId = useAccountId()
  const overlayRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const openCloseWalletPopupRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)

  trackingRefs.add(rootRef)
  trackingRefs.add(overlayRef)

  const showDrawer = () => {
    setOpen(!open)
  }

  const onClose = () => {
    setOpen(!open)
  }

  const handleMutationIconClick = () => {
    setProfileOpen((val) => !val)
  }

  const isMutationIconButton = !!connectWallet && !!disconnectWallet && !!nearNetwork

  return (
    <WrapperDriver $isOpen={open} ref={overlayRef}>
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
        <SidePanelWrapper
          ref={rootRef}
          $isApps={mutationApps.length > 0}
          data-mweb-context-type="mweb-overlay"
          data-mweb-context-parsed={JSON.stringify({ id: 'mweb-overlay' })}
          data-mweb-context-level="system"
        >
          <TopBlock $open={isOpen || mutationApps.length > 0} $noMutations={!mutationApps.length}>
            <MutationIconWrapper
              $isButton={isMutationIconButton}
              title={baseMutation?.metadata.name}
              onClick={handleMutationIconClick}
              ref={openCloseWalletPopupRef}
              data-mweb-context-type="mweb-overlay"
              data-mweb-context-parsed={JSON.stringify({
                id: isMutationIconButton ? 'mutation-button' : 'mutation-icon',
              })}
              data-mweb-context-level="system"
            >
              {baseMutation?.metadata.image ? (
                <Image image={baseMutation?.metadata.image} />
              ) : (
                <MutationFallbackIcon />
              )}
              <div data-mweb-insertion-point="mutation-icon" style={{ display: 'none' }} />
            </MutationIconWrapper>
          </TopBlock>
          {isOpen || !mutationApps.length ? null : (
            <ButtonWrapper
              data-mweb-insertion-point="mweb-actions-panel"
              data-mweb-layout-manager="vertical"
            >
              {open ? (
                <Button block type="primary" onClick={showDrawer}>
                  {BellIcon('white', 'white')}
                </Button>
              ) : (
                // : notifications && notifications.length ? (
                //   <Button block onClick={showDrawer}>
                //     <BellWithCircle />
                //   </Button>
                // )
                <Button block onClick={showDrawer}>
                  {BellIcon('#7A818B', '#7A818B')}
                </Button>
              )}
            </ButtonWrapper>
          )}
          {isOpen ? <AppsWrapper>{children}</AppsWrapper> : null}
          {mutationApps.length > 0 ? (
            <ButtonOpenWrapper
              $open={isOpen || mutationApps.length > 0}
              data-mweb-context-type="mweb-overlay"
              data-mweb-context-parsed={JSON.stringify({ id: 'open-apps-button' })}
              data-mweb-context-level="system"
            >
              <ButtonOpen
                $open={isOpen}
                className={isOpen ? 'svgTransform' : ''}
                onClick={() => {
                  onClose()
                  setIsOpen(!isOpen)
                }}
              >
                <ArrowIcon />
              </ButtonOpen>
              <div data-mweb-insertion-point="open-apps-button" style={{ display: 'none' }} />
            </ButtonOpenWrapper>
          ) : null}
          {isProfileOpen && isMutationIconButton ? (
            <Profile
              accountId={loggedInAccountId}
              closeProfile={() => {
                setProfileOpen(false)
              }}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              nearNetwork={nearNetwork}
              trackingRefs={trackingRefs}
              openCloseWalletPopupRef={openCloseWalletPopupRef}
            />
          ) : null}
        </SidePanelWrapper>
      </Drawer>

      <OverlayWrapper
        apps={mutationApps.length > 0}
        onClose={onClose}
        open={open}
        connectWallet={connectWallet}
        loggedInAccountId={loggedInAccountId}
      />
    </WrapperDriver>
  )
}
