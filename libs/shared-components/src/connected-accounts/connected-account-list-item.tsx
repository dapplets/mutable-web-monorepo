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

type CAListProps = {
  user?: IConnectedAccountUser
  maxLength?: number
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  nearNetwork: NearNetworks
  loggedInAccountId: string
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
  maxLength = 32,
  trackingRefs,
  nearNetwork,
  loggedInAccountId,
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
  useOutside(ref, () => setIsListOpened(false), trackingRefs)
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
    if (!user || !loggedInAccountId) return
    setIsListOpened(false)
    if (isActive && socialAccount) {
      const proofUrl = `https://${socialAccount.origin.toLowerCase()}.com/` + socialAccount.name // ToDo: hardcoded: can be different URLs + less secure
      const isConditionMet = socialNetworkConnectionCondition({
        socNet_id: socialAccount.name,
        near_id: loggedInAccountId,
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
      loggedInAccountId,
    })
  }

  return (
    <AccountListItem
      name={user?.name}
      origin={user?.origin}
      maxLength={user?.accountActive ? maxLength - 6 : maxLength}
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
            !isListOpened && setIsListOpened(true)
            setBurgerRects((e.currentTarget as HTMLButtonElement)?.getClientRects())
            ref.current?.focus()
          }}
        >
          {isWaiting ? <Spin size="small" /> : <MoreHoriz />}
        </button>
      )}

      {isListOpened && user
        ? createPortal(
            <div
              className="list"
              style={{
                top: burgerRects
                  ? window.innerHeight - burgerRects[0].bottom > 120
                    ? burgerRects[0].bottom - 50
                    : burgerRects[0].bottom - 186
                  : 100,
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
                  <button className="listItem" onClick={handleClickDisconnect}>
                    Unlink account
                  </button>
                </li>
                <li>
                  <button
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
            </div>,
            profileRef.current ?? document.body
          )
        : null}
    </AccountListItem>
  )
}

export default CAListItem
