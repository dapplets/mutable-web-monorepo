import { IConnectedAccountUser } from '@mweb/backend'
import cn from 'classnames'
import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import useCopied from '../hooks/useCopyed'
import { Copy16, MoreHoriz } from './assets/icons'
import { GithubIcon, XIcon } from './assets/resources/social'
import { resources } from './resources'
import { Spin } from 'antd'
import { useOutside } from '../hooks/use-outside'

const CAListItemWrapper = styled.div`
  --primary: rgba(56, 75, 255, 1);
  --primary-pressed: rgba(56, 75, 255, 0.4);
  --pure-white: #fff;
  --web-bg: #eaf0f0;
  --main-black: #02193a;

  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: auto;
  padding: 4px 10px !important;
  border-radius: 12px;
  background-color: rgb(248, 249, 255);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

  &.pointer {
    cursor: pointer;
  }

  &.info {
    width: 250px;
    background: none;
  }

  .imgUser {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    /* width: 22px;
    height: 22px; */

    /* background-color: white;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 10%));
    border-radius: 50%; */

    /* &.empty {
      background-color: var(--web-bg);
    } */

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &.info .imgUser svg {
    width: 22px;
    height: 22px;
    fill: #636363;
  }

  .nameUser {
    flex-grow: 1;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    line-height: 150%;
    color: var(--main-black);
    text-align: left;
  }

  &.info .nameUser {
    width: calc(100% - 22px);
    color: #636363;
    word-wrap: break-word;
  }

  &.nameUserActive {
    background: var(--primary) !important;

    .nameUser {
      color: var(--pure-white);
    }
  }

  .mainAccount {
    display: flex;
    align-items: center;
    border: #7a818b solid 1px;
    border-radius: 6px;
    padding: 0 4px;
    font-size: 12px;
    line-height: 136%;
    color: #5e646d;
  }

  .copyButton {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: none;
    color: #7a818b;
    transition: all 0.15s ease;

    &:hover {
      color: #6e757e;
      background-color: #dae1ea;
    }

    &:active {
      color: #5e646d;
      background-color: #c9d2dd;
    }

    &.disabled {
      cursor: default;
      color: #c9d2dd;
    }
  }

  .list {
    position: absolute;
    top: calc(100% - 2px);
    right: 6px;
    z-index: 1;
    padding: 8px;
    background: white;
    border-radius: 8px;
    box-shadow:
      0px 4px 20px 0px #0b576f26,
      0px 4px 5px 0px #2d343c1a;

    &.openListUp {
      top: unset;
      bottom: calc(100% - 2px);
    }

    button {
      border: none;
      background: none;
      margin: 4px;
      padding: 2px;
    }
  }
`

const iconForSocial = {
  twitter: XIcon,
  x: XIcon,
  github: GithubIcon,
}

export const CAListItem = ({
  user,
  onClick,
  maxLength = 32,
  copyButton = false,
  info = false,
  trackingRefs,
  openListUp,
}: {
  user?: IConnectedAccountUser
  onClick?: (account: IConnectedAccountUser) => Promise<void>
  maxLength?: number
  copyButton?: boolean
  info?: boolean
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  openListUp?: boolean
}) => {
  const [isListOpened, setIsListOpened] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const ref = useRef(null)
  useOutside(ref, () => setIsListOpened(false), trackingRefs)
  const useCopiedResult = user?.name && useCopied(user.name)
  const InfoIcon = info && user?.origin && iconForSocial[user.origin as keyof typeof iconForSocial]
  const ResourceIcon = user && resources[user.origin].icon

  return (
    <CAListItemWrapper
      className={cn({
        info: info,
      })}
    >
      {user && ResourceIcon ? (
        <>
          {info && InfoIcon ? (
            <div className="imgUser">
              <InfoIcon />
            </div>
          ) : (
            <div className="imgUser">
              <ResourceIcon />
            </div>
          )}
          <h4 className="nameUser">
            {!info && user.name.length > (user?.accountActive ? maxLength - 6 : maxLength)
              ? user.name.slice(0, ((user?.accountActive ? maxLength - 6 : maxLength) - 2) / 2) +
                '...' +
                user.name.slice(-((user?.accountActive ? maxLength - 6 : maxLength) - 4) / 2)
              : user.name}
          </h4>

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
        </>
      ) : (
        <>
          <div className={cn('imgUser', 'empty')}></div>
          <h4 className="nameUser">None</h4>
        </>
      )}
    </CAListItemWrapper>
  )
}
