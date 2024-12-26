import { IConnectedAccountUser } from '@mweb/backend'
import cn from 'classnames'
import React from 'react'
import styled from 'styled-components'
import useCopied from '../hooks/useCopyed'
import { Copy16 } from './assets/icons'
import { GithubIcon, XIcon } from './assets/resources/social'
import { resources } from './resources'

const CAUserButtonWrapper = styled.div`
  --primary: rgba(56, 75, 255, 1);
  --primary-pressed: rgba(56, 75, 255, 0.4);
  --pure-white: #fff;
  --web-bg: #eaf0f0;
  --main-black: #2a2a2a;

  position: relative;
  display: flex;
  align-items: center;
  height: auto;
  min-height: 44px;
  padding: 0 10px !important;
  border-radius: 22px;

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

    width: 22px;
    height: 22px;
    margin-right: 10px;

    background-color: white;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 10%));
    border-radius: 50%;

    &.empty {
      background-color: var(--web-bg);
    }

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

    padding: 10px 14px 10px 0;

    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    line-height: 125%;
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

  .copyButton {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 25px;
    height: 25px;

    background: none;

    svg {
      path {
        fill: #919191 !important;
        transition: all 0.3s;
      }
    }

    &:hover {
      svg {
        path {
          fill: var(--primary-hover) !important;
          transition: all 0.3s;
        }
      }
    }

    &:active {
      svg {
        path {
          fill: var(--primary) !important;
          transition: all 0.3s;
        }
      }
    }
  }
`

const iconForSocial = {
  twitter: XIcon,
  x: XIcon,
  github: GithubIcon,
}

export const CAUserButton = ({
  user,
  onClick,
  maxLength = 32,
  color = 'white',
  copyButton = false,
  info = false,
}: {
  user?: IConnectedAccountUser
  onClick?: (account: IConnectedAccountUser) => Promise<void>
  maxLength?: number
  color?: string
  copyButton?: boolean
  info?: boolean
}) => {
  const useCopiedResult = user?.name && useCopied(user.name)
  const InfoIcon = info && user?.origin && iconForSocial[user.origin as keyof typeof iconForSocial]
  const ResourceIcon = user && resources[user.origin].icon

  return (
    <CAUserButtonWrapper
      className={cn({
        nameUserActive: user?.accountActive,
        pointer: !!onClick,
        info: info,
      })}
      style={{ backgroundColor: color }}
      onClick={onClick && (() => user && onClick(user))}
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
            {!info && user.name.length > maxLength
              ? user.name.slice(0, (maxLength - 2) / 2) +
                '...' +
                user.name.slice(-(maxLength - 4) / 2)
              : user.name}
          </h4>
          {copyButton && (
            <button className="copyButton" onClick={() => useCopiedResult && useCopiedResult[1]()}>
              <Copy16 />
            </button>
          )}
        </>
      ) : (
        <>
          <div className={cn('imgUser', 'empty')}></div>
          <h4 className="nameUser">None</h4>
        </>
      )}
    </CAUserButtonWrapper>
  )
}
