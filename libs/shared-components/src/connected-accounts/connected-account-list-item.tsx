import { IConnectedAccountUser, NearNetworks } from '@mweb/backend'
import { RequestStatus, useConnectionRequest, useGetRequests } from '@mweb/react-engine'
import { useChangeCAStatus } from '@mweb/react-engine'
import { Spin } from 'antd'
import React, { FC, useEffect, useRef, useState } from 'react'
import { useOutside } from '../hooks/use-outside'
import useCopied from '../hooks/use-copied'
import AccountListItem from './account-list-item'
import { MoreHoriz } from './assets/icons'
import { StatusBadge } from './status-badge'
import { createPortal } from 'react-dom'
import { socialNetworkConnectionCondition } from './utils'
import styled from 'styled-components'

const List = styled.div`
  position: absolute;
  right: 6px;
  z-index: 1;
  padding: 8px !important;
  background: var(--pure-white);
  border-radius: 8px;
  box-shadow:
    0px 4px 20px 0px rgba(11, 87, 111, 0.149),
    0px 4px 5px 0px rgba(45, 52, 60, 0.102);

  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  button {
    border: none;
    background: none;
    margin: 4px;
    padding: 2px;
    transition: color 0.1s ease;
    cursor: pointer;

    :disabled {
      cursor: default;
    }

    :hover:not(:disabled) {
      color: var(--primary-hover);
    }

    :active:not(:disabled) {
      color: var(--primary-pressed);
    }
  }
`

type CAListProps = {
  user?: IConnectedAccountUser
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  nearNetwork: NearNetworks
  loggedInNearAccountId: string | null
  socialAccount: {
    name: string
    origin: string
    fullname: string
    websiteName: string
  } | null
  profileRef: React.RefObject<HTMLDivElement>
}

const CAListItem: FC<CAListProps> = ({
  user,
  trackingRefs,
  nearNetwork,
  loggedInNearAccountId,
  socialAccount,
  profileRef,
}) => {
  const [isActive, setIsActive] = useState<boolean>(
    !!user &&
      !!socialAccount &&
      user.name === socialAccount.name &&
      user.origin === socialAccount.origin
  )
  const [isConditionDone, setIsConditionDone] = useState(true)
  const { makeConnectionRequest } = useConnectionRequest()
  const { requests } = useGetRequests()
  const request = requests.find(
    (r) => r.type === 'disconnect' && r.payload.has(`${user?.name}/${user?.origin}`)
  )
  const status = request?.status ?? RequestStatus.DEFAULT
  const { changeCAStatus, isLoading: isWaiting } = useChangeCAStatus()
  const [isListOpened, setIsListOpened] = useState(false)
  const [burgerRects, setBurgerRects] = useState<DOMRectList | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setTimeout(() => setIsListOpened(false), 500), trackingRefs)
  const useCopiedResult = user?.name && useCopied(user.name)
  useEffect(() => {
    setIsActive(
      !!user &&
        !!socialAccount &&
        user.name === socialAccount.name &&
        user.origin === socialAccount.origin
    )
    setIsConditionDone(true)
  }, [user, socialAccount])

  const handleClickDisconnect = async () => {
    if (!user || !loggedInNearAccountId) return
    setIsListOpened(false)
    if (isActive && socialAccount) {
      const proofUrl = `https://${socialAccount.origin.toLowerCase()}.com/` + socialAccount.name // ToDo: hardcoded: can be different URLs + less secure
      const isConditionMet = socialNetworkConnectionCondition({
        socNet_id: socialAccount.name,
        near_id: loggedInNearAccountId,
        url: proofUrl,
        fullname: socialAccount.fullname,
      })
      if (!isConditionMet) {
        setIsConditionDone(false)
        return
      }
    }
    makeConnectionRequest({
      name: user.name,
      origin: user.origin,
      isUnlink: true,
      nearNetwork,
      loggedInAccountId: loggedInNearAccountId,
    })
  }

  return (
    <AccountListItem
      name={user?.name}
      origin={user?.origin}
      disabled={status === RequestStatus.SIGNING || status === RequestStatus.VERIFYING}
      isActive={isActive}
      message={
        request?.message
          ? { text: request.message, type: 'error' }
          : !isConditionDone && !!socialAccount
            ? {
                text: `To unlink the account, copy your logged-in NEAR address and add it to your ${socialAccount.websiteName} account name.`,
                type: 'warning',
              }
            : undefined // ToDo: process different messages
      }
    >
      {user?.accountActive ? <div className="mainAccount">Main</div> : null}

      {status !== RequestStatus.DEFAULT ? (
        <StatusBadge status={status} />
      ) : (
        <button
          className="copyButton"
          disabled={isWaiting}
          onClick={(e) => {
            if (!isListOpened) {
              setIsListOpened(true)
              setBurgerRects((e.currentTarget as HTMLButtonElement)?.getClientRects())
            } else {
              setIsListOpened(false)
            }
          }}
        >
          {isWaiting ? <Spin size="small" /> : <MoreHoriz />}
        </button>
      )}

      {isListOpened && user
        ? createPortal(
            <List
              style={{
                top: burgerRects
                  ? window.innerHeight - burgerRects[0].bottom > 120
                    ? burgerRects[0].bottom + 8
                    : burgerRects[0].bottom - 128
                  : 100,
                right: 24,
              }}
              ref={ref}
            >
              <ul>
                <li>
                  <button
                    className="listItem"
                    onClick={() => {
                      useCopiedResult && useCopiedResult[1]()
                      setIsListOpened(false)
                    }}
                  >
                    Copy address
                  </button>
                </li>
                <li>
                  <button
                    disabled={!loggedInNearAccountId}
                    className="listItem"
                    onClick={handleClickDisconnect}
                  >
                    Unlink account
                  </button>
                </li>
                <li>
                  <button
                    disabled={!loggedInNearAccountId}
                    className="listItem"
                    onClick={async () => {
                      setIsListOpened(false)
                      changeCAStatus(user.name, user.origin)
                    }}
                  >
                    {user?.accountActive ? 'Reset main' : 'Set as main'}
                  </button>
                </li>
              </ul>
            </List>,
            profileRef.current ?? document.body
          )
        : null}
    </AccountListItem>
  )
}

export default CAListItem
