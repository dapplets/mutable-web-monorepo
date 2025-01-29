import { IConnectedAccountUser, NearNetworks } from '@mweb/backend'
import {
  RequestStatus,
  useChangeCAStatus,
  useConnectedAccounts,
  useConnectionRequest,
} from '@mweb/engine'
import { Spin } from 'antd'
import cn from 'classnames'
import React, { FC, useRef, useState } from 'react'
import { useOutside } from '../hooks/use-outside'
import useCopied from '../hooks/useCopyed'
import AccountListItem from './account-list-item'
import { MoreHoriz } from './assets/icons'
import { StatusBadge } from './status-badge'

type CAListProps = {
  user?: IConnectedAccountUser
  maxLength?: number
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  openListUp?: boolean
  nearNetwork: NearNetworks
  loggedInAccountId: string
  isActive: boolean
}

const CAListItem: FC<CAListProps> = ({
  user,
  maxLength = 32,
  trackingRefs,
  openListUp,
  nearNetwork,
  loggedInAccountId,
  isActive,
}) => {
  const { makeConnectionRequest } = useConnectionRequest()
  const { requests } = useConnectedAccounts()
  const request = requests.find(
    (r) => r.type === 'disconnect' && r.payload.has(`${user?.name}/${user?.origin}`)
  )
  const status = request?.status ?? RequestStatus.DEFAULT
  const { changeCAStatus } = useChangeCAStatus()
  const [isListOpened, setIsListOpened] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const ref = useRef(null)
  useOutside(ref, () => setIsListOpened(false), trackingRefs)
  const useCopiedResult = user?.name && useCopied(user.name)

  return (
    <AccountListItem
      name={user?.name}
      origin={user?.origin}
      maxLength={user?.accountActive ? maxLength - 6 : maxLength}
      disabled={status === RequestStatus.CLAIMING || status === RequestStatus.VERIFICATION}
      isActive={isActive}
      message={
        request?.message ? { text: 'The transaction is rejected', type: 'error' } : undefined // ToDo: process different messages
      }
    >
      {user?.accountActive ? <div className="mainAccount">Main</div> : null}

      {status !== RequestStatus.DEFAULT ? (
        <StatusBadge status={status} />
      ) : (
        <button
          className="copyButton"
          disabled={isWaiting}
          onClick={() => !isListOpened && setIsListOpened(true)}
        >
          {isWaiting ? <Spin size="small" /> : <MoreHoriz />}
        </button>
      )}

      {isListOpened && user ? (
        <div className={cn('list', { openListUp })} ref={ref}>
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
                className="listItem"
                onClick={() => {
                  setIsListOpened(false)
                  makeConnectionRequest({
                    name: user.name,
                    origin: user.origin,
                    isUnlink: true,
                    nearNetwork,
                    loggedInAccountId,
                  })
                }}
              >
                Unlink account
              </button>
            </li>
            <li>
              <button
                className="listItem"
                onClick={async () => {
                  setIsListOpened(false)
                  setIsWaiting(true)
                  await changeCAStatus(user.name, user.origin)
                    .catch((e) => console.log(e))
                    .finally(() => setIsWaiting(false))
                }}
              >
                {user?.accountActive ? 'Reset main' : 'Set as main'}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </AccountListItem>
  )
}

export default CAListItem
