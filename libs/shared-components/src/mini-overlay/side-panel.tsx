import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { useNotifications } from '@mweb/engine'
import { AppWithSettings, MutationDto } from '@mweb/backend'
import { Image } from '../common/image'
import Profile from './profile'
import { IWalletConnect } from './types'
import { MutationFallbackIcon, ArrowIcon, BellIcon, BellWithCircle } from './assets/icons'

const SidePanelWrapper = styled.div<{ $isApps: boolean }>`
  position: absolute;
  z-index: 6000;
  display: flex;
  top: 68px;
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
  gap: 10px;

  .ant-btn {
    padding: 0 0 0 16px;
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

const ActionLikeButton = styled(Button)<{ type: string }>`
  width: 46px !important;
  height: 22px;
  border-radius: 4px;
  display: flex;
  justify-content: flex-start;

  circle {
    transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    stroke: ${(props) => (props.type === 'primary' ? '#1677ff' : 'white')};
    fill: ${(props) => (props.type === 'primary' ? 'white' : '#d9304f')};
  }

  &:hover circle {
    stroke: ${(props) => (props.type === 'primary' ? '#4096ff' : 'white')};
  }

  &:active circle {
    stroke: ${(props) => (props.type === 'primary' ? '#0958d9' : 'white')};
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 6px 5px 7px;
  margin-top: -7px;
`

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 5px 6px 5px 7px;
  gap: 10px;
`

const ButtonOpenWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: 0 0 0 4px;
  padding: 6px;

  .ant-btn {
    padding: 0 0 0 15px;
  }

  .svg-transform {
    svg {
      transform: rotate(180deg);
    }
  }
`

interface ISidePanelProps extends Partial<IWalletConnect> {
  children: React.ReactNode
  baseMutation: MutationDto | null
  mutationApps: AppWithSettings[]
  loggedInAccountId?: string | null
  overlayRef: React.RefObject<HTMLDivElement>
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  isNotificationPageOpen: boolean
  openCloseNotificationPage: React.Dispatch<React.SetStateAction<boolean>>
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
  isNotificationPageOpen,
  openCloseNotificationPage,
}) => {
  const { notifications } = useNotifications()
  const [haveUnreadNotifications, setHaveUnreadNotifications] = useState<boolean>(
    !!notifications.filter((not) => not.status === 'new').length
  )
  const [isOpenAppsPane, openCloseAppsPane] = useState(false)
  const [isProfileOpen, openCloseProfile] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const openCloseWalletPopupRef = useRef<HTMLButtonElement>(null)

  trackingRefs.add(rootRef)
  trackingRefs.add(overlayRef)

  useEffect(() => {
    setHaveUnreadNotifications(!!notifications.filter((not) => not.status === 'new').length)
  }, [notifications])

  const isMutationIconButton = !!connectWallet && !!disconnectWallet && !!nearNetwork

  return (
    <SidePanelWrapper
      ref={rootRef}
      $isApps={!!mutationApps.length}
      data-mweb-context-type="mweb-overlay"
      data-mweb-context-parsed={JSON.stringify({ id: 'mweb-overlay' })}
      data-mweb-context-level="system"
    >
      <TopBlock $open={isOpenAppsPane || !!mutationApps.length} $noMutations={!mutationApps.length}>
        <MutationIconWrapper
          $isButton={isMutationIconButton}
          title={baseMutation?.metadata.name}
          onClick={() => openCloseProfile((val) => !val)}
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
        <ActionLikeButton
          block
          type={isNotificationPageOpen ? 'primary' : 'default'}
          onClick={() => openCloseNotificationPage((val) => !val)}
        >
          {haveUnreadNotifications ? <BellWithCircle /> : <BellIcon />}
        </ActionLikeButton>
      </TopBlock>

      {mutationApps.length ? (
        <>
          {!isOpenAppsPane ? (
            <ButtonWrapper
              data-mweb-insertion-point="mweb-actions-panel"
              data-mweb-layout-manager="vertical"
            />
          ) : (
            <AppsWrapper>{children}</AppsWrapper>
          )}
          <ButtonOpenWrapper
            data-mweb-context-type="mweb-overlay"
            data-mweb-context-parsed={JSON.stringify({ id: 'open-apps-button' })}
            data-mweb-context-level="system"
          >
            <ActionLikeButton
              type={isOpenAppsPane ? 'primary' : 'default'}
              className={isOpenAppsPane ? 'svg-transform' : ''}
              onClick={() => openCloseAppsPane((val) => !val)}
            >
              <ArrowIcon />
            </ActionLikeButton>
            <div data-mweb-insertion-point="open-apps-button" style={{ display: 'none' }} />
          </ButtonOpenWrapper>
        </>
      ) : null}

      {isProfileOpen && isMutationIconButton ? (
        <Profile
          accountId={loggedInAccountId ?? null}
          closeProfile={() => {
            openCloseProfile(false)
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
