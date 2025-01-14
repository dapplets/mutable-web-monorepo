import { AppWithSettings, EntitySourceType, MutationDto } from '@mweb/backend'
import { useNotifications } from '@mweb/engine'
import { Button } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { Badge } from '../common/Badge'
import { Image } from '../common/image'
import {
  ArrowIcon,
  BellIcon,
  BellWithCircle,
  MutationFallbackIcon,
  PersonAddAlt,
} from './assets/icons'
import { IWalletConnect } from './types'

const SidePanelWrapper = styled.div<{ $isApps: boolean }>`
  position: absolute;
  z-index: 6000;
  display: flex;
  top: 68px;
  user-select: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  border-radius: 4px 0px 0px 4px;
  background: ${(props) => (props.$isApps ? '#EEEFF5' : '#F8F9FF')};
  box-shadow: 0 4px 20px 0 rgba(11, 87, 111, 0.15);
  font-family: sans-serif;
  box-sizing: border-box;
`

const BadgeWrapper = styled.span`
  position: absolute;
  left: 0;
  bottom: -5px;
`

const TopBlock = styled.div<{ $open?: boolean; $noMutations: boolean }>`
  direction: ltr;
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
  color: ${(props) => (props.type === 'primary' ? 'white' : 'rgba(2, 25, 58, 1)')};

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
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overflow-x: hidden;

  /* width */
  &::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #1879ce70;
    border-radius: 10px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #1879ced8;
  }

  & button {
    direction: ltr;
  }
`

const ButtonOpenWrapper = styled.div`
  direction: ltr;
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
  isOverlayOpened: boolean
  openOverlay: React.Dispatch<React.SetStateAction<boolean>>
}

const UberSausage: React.FC<ISidePanelProps> = ({
  children,
  nearNetwork,
  onConnectWallet: connectWallet,
  onDisconnectWallet: disconnectWallet,
  baseMutation,
  mutationApps,
  overlayRef,
  trackingRefs = new Set(),
  isOverlayOpened,
  openOverlay,
}) => {
  const navigate = useNavigate()
  const { notifications } = useNotifications()
  const [haveUnreadNotifications, setHaveUnreadNotifications] = useState<boolean>(
    !!notifications.filter((not) => not.status === 'new').length
  )
  const [isOpenAppsPane, openCloseAppsPane] = useState(false)

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
      data-testid="mweb-overlay"
      data-mweb-context-type="mweb-overlay"
      data-mweb-context-parsed={JSON.stringify({ id: 'mweb-overlay' })}
      data-mweb-context-level="system"
    >
      <TopBlock $open={isOpenAppsPane || !!mutationApps.length} $noMutations={!mutationApps.length}>
        <MutationIconWrapper
          onClick={() => openOverlay((val) => !val)}
          $isButton={isMutationIconButton}
          title={baseMutation?.metadata.name}
          ref={openCloseWalletPopupRef}
          data-testid="mutation-button"
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
          {baseMutation?.source === EntitySourceType.Local && (
            <BadgeWrapper>
              <Badge text={baseMutation.source} theme={'blue'} />
            </BadgeWrapper>
          )}
          <div data-mweb-insertion-point="mutation-icon" style={{ display: 'none' }} />
        </MutationIconWrapper>
        <ActionLikeButton
          block
          type={isOverlayOpened && location.pathname === '/system/main' ? 'primary' : 'default'}
          onClick={() => {
            openOverlay((val) => (location.pathname !== '/system/main' ? true : !val))
            navigate!(`/system/main`)
          }}
        >
          {haveUnreadNotifications ? <BellWithCircle /> : <BellIcon />}
        </ActionLikeButton>
        <ActionLikeButton
          block
          type={isOverlayOpened && location.pathname === '/system/profile' ? 'primary' : 'default'}
          onClick={() => {
            openOverlay((val) => (location.pathname !== '/system/profile' ? true : !val))
            navigate!(`/system/profile`)
          }}
          style={{ paddingLeft: '14px' }}
          data-testid="profile-action-button"
        >
          <PersonAddAlt />
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
            <div style={{ display: 'flex', direction: 'rtl' }}>
              <AppsWrapper>{children}</AppsWrapper>
            </div>
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
    </SidePanelWrapper>
  )
}

export default UberSausage
