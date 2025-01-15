import { IConnectedAccountUser } from '@mweb/backend'
import { Spin } from 'antd'
import cn from 'classnames'
import React, { FC, useRef, useState } from 'react'
import { useOutside } from '../hooks/use-outside'
import useCopied from '../hooks/useCopyed'
import AccountListItem from './account-list-item'
import { MoreHoriz } from './assets/icons'

type CAListProps = {
  user?: IConnectedAccountUser
  onClick?: (account: IConnectedAccountUser) => Promise<void>
  maxLength?: number
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  openListUp?: boolean
}

const CAListItem: FC<CAListProps> = ({
  user,
  onClick,
  maxLength = 32,
  trackingRefs,
  openListUp,
}) => {
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
    >
      {user?.accountActive ? <div className="mainAccount">Main</div> : null}

      <button
        className="copyButton"
        disabled={isWaiting}
        onClick={() => !isListOpened && setIsListOpened(true)}
      >
        {isWaiting ? <Spin size="small" /> : <MoreHoriz />}
      </button>

      {isListOpened ? (
        <div className={cn('list', { openListUp })} ref={ref}>
          <ul>
            <li>
              <button
                className="listItem"
                onClick={
                  onClick && user
                    ? async () => {
                        setIsListOpened(false)
                        setIsWaiting(true)
                        await onClick(user)
                          .catch((e) => console.log(e))
                          .finally(() => setIsWaiting(false))
                      }
                    : undefined
                }
              >
                {user?.accountActive ? 'Reset main' : 'Set as main'}
              </button>
            </li>
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
          </ul>
        </div>
      ) : null}
    </AccountListItem>
  )
}

export default CAListItem
