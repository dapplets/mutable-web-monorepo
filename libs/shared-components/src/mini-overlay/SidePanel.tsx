import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { AppWithSettings, MutationDto, useNotifications } from '@mweb/engine'
import { Image } from '../common/Image'
import Profile, { IWalletConnect } from './Profile'
import { MutationFallbackIcon, ArrowIcon, BellIcon, BellWithCircle } from './assets/icons'

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
  align-items: center;
  padding: 6px;
  background: ${(props) => (props.$open ? '#fff' : 'transparent')};
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: ${(props) => (props.$noMutations ? '4px 0 0 4px' : '4px 0 0 0')};
  position: relative;
  gap: 6px;
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: content-box !important;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 46px;
  margin-top: -7px;
  padding: 0 5px 5px;
`

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 6px;
  gap: 10px;
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

const BellButton = styled(Button)<{ type?: string }>`
  width: 44px !important;
  height: 22px;
  padding: 0 0 0 15px;
  display: flex;
  justify-content: flex-start;

  svg > circle {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    stroke: ${(props) => (props.type === 'primary' ? '#1677ff' : 'white')};
  }

  &:hover svg > circle {
    stroke: ${(props) => (props.type === 'primary' ? '#4096ff' : 'white')};
  }

  &:active svg > circle {
    stroke: ${(props) => (props.type === 'primary' ? '#0958d9' : 'white')};
  }
`

interface ISidePanelProps extends Partial<IWalletConnect> {
  children: React.ReactNode
  baseMutation: MutationDto | null
  mutationApps: AppWithSettings[]
  loggedInAccountId?: string | null
  overlayRef: React.RefObject<HTMLDivElement>
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidePanel: React.FC<ISidePanelProps> = ({
  children,
  nearNetwork,
  connectWallet,
  disconnectWallet,
  loggedInAccountId,
  baseMutation,
  mutationApps,
  overlayRef,
  trackingRefs = new Set(),
  open, // ToDo: change name
  setOpen, // ToDo: change name
}) => {
  const { notifications } = useNotifications()
  const [haveUnreadNotifications, setHaveUnreadNotifications] = useState<boolean>(
    !!notifications.filter((not) => not.status === 'new').length
  )
  const [isOpen, setIsOpen] = useState(false) // ToDo: change name
  const [isProfileOpen, setProfileOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const openCloseWalletPopupRef = useRef<HTMLButtonElement>(null)

  trackingRefs.add(rootRef)
  trackingRefs.add(overlayRef)

  useEffect(() => {
    setHaveUnreadNotifications(!!notifications.filter((not) => not.status === 'new').length)
  }, [notifications])

  const showDrawer = () => setOpen((val) => !val)

  const handleMutationIconClick = () => {
    setProfileOpen((val) => !val)
  }

  const isMutationIconButton = !!connectWallet && !!disconnectWallet && !!nearNetwork

  return (
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
        {open ? (
          <BellButton block type="primary" onClick={showDrawer}>
            {haveUnreadNotifications ? (
              <BellWithCircle isPrimary={true} />
            ) : (
              <BellIcon color="white" />
            )}
          </BellButton>
        ) : (
          <BellButton block onClick={showDrawer}>
            {haveUnreadNotifications ? (
              <BellWithCircle isPrimary={false} />
            ) : (
              <BellIcon color="#7A818B" />
            )}
          </BellButton>
        )}
      </TopBlock>
      {isOpen || !mutationApps.length ? null : (
        <ButtonWrapper
          data-mweb-insertion-point="mweb-actions-panel"
          data-mweb-layout-manager="vertical"
        />
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
              setOpen(false)
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
          accountId={loggedInAccountId ?? null}
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
  )
}

export default SidePanel
