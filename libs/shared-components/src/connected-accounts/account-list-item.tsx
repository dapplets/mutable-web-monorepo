import cn from 'classnames'
import React, { FC, ReactElement } from 'react'
import styled from 'styled-components'
import PictureIcon from './assets/resources/picture'
import { resources } from './resources'

const Wrapper = styled.div<{ $hasMessage?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ $hasMessage }) => ($hasMessage ? '4px' : '0')};
  border-radius: 12px;
  background-color: var(--muddy-white);
  font-family: var(--font-default);
  padding: 4px 10px !important;
  transition: gap 0.1s ease;
`

const Main = styled.div<{ $disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  height: auto;
  user-select: none;

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
    opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};

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
    fill: rgb(99, 99, 99);
  }

  .nameUser {
    display: flex;
    align-items: center;
    gap: 6px;

    h4 {
      line-height: 150%;
      color: ${({ $disabled }) => ($disabled ? 'var(--main-grey)' : 'var(--main-black)')};
      text-align: left;
    }
  }

  .active-account {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--success);
  }

  .mainAccount {
    display: flex;
    align-items: center;
    border: 1px solid var(--gray);
    border-radius: 6px;
    padding: 0 4px;
    font-size: 12px;
    line-height: 136%;
    color: var(--gray-hover);
    gap: 4px;
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
    color: var(--gray);
    transition: all 0.15s ease;

    &:hover {
      color: var(--gray-hover);
      background-color: rgb(218, 225, 234);
    }

    &:active {
      color: var(--gray-active);
      background-color: rgb(201, 210, 221);
    }

    &:disabled {
      cursor: default;
      color: rgb(201, 210, 221);

      &:hover {
        color: rgb(201, 210, 221);
        background: none;
      }

      &:active {
        color: rgb(201, 210, 221);
        background: none;
      }
    }
  }

  .list {
    position: absolute;
    top: calc(100% - 2px);
    right: 6px;
    z-index: 1;
    padding: 8px;
    background: var(--pure-white);
    border-radius: 8px;
    box-shadow:
      0px 4px 20px 0px rgba(11, 87, 111, 0.149),
      0px 4px 5px 0px rgba(45, 52, 60, 0.102);

    &.openListUp {
      top: unset;
      bottom: calc(100% - 2px);
    }

    button {
      border: none;
      background: none;
      margin: 4px;
      padding: 2px;
      transition: color 0.1s ease;

      :hover {
        color: var(--primary-hover);
      }

      :active {
        color: var(--primary-pressed);
      }
    }
  }
`

const Text = styled.p<{ $type: string }>`
  font-family: var(--font-default);
  color: ${(props) => (props.$type === 'error' ? 'var(--error)' : 'var(--gray)')};
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
  transition:
    height 0.3s ease,
    transform 0.1s ease;
  height: ${(props) => (props.$type === 'error' ? '20px' : '0')};
  transform: ${(props) => (props.$type === 'error' ? 'scaleY(1)' : 'scaleY(0)')};
`

type AccountListItemProps = {
  children?: ReactElement | ReactElement[] | null | (ReactElement | null)[]
  name?: string
  origin?: string
  maxLength?: number
  disabled?: boolean
  isActive?: boolean
  message?: { text: string; type: string }
}

const AccountListItem: FC<AccountListItemProps> = ({
  children,
  name,
  origin,
  maxLength = 32,
  disabled,
  isActive,
  message,
}) => {
  const ResourceIcon = (origin && resources[origin]?.icon) || null
  return (
    <Wrapper $hasMessage={!!message}>
      {name ? (
        <>
          <Main $disabled={disabled}>
            <div className="imgUser">{ResourceIcon ? <ResourceIcon /> : <PictureIcon />}</div>
            <div className="nameUser">
              <h4>
                {name.length > maxLength
                  ? name.slice(0, (maxLength - 2) / 2) + '...' + name.slice(-(maxLength - 4) / 2)
                  : name}
              </h4>
              {isActive ? (
                <div className="active-account" title="Current logged in account"></div>
              ) : null}
            </div>
            {children}
          </Main>
          <Text $type={message?.type ?? 'none'}>{message?.text}</Text>
        </>
      ) : (
        <Main $disabled={disabled}>
          <div className={cn('imgUser', 'empty')}></div>
          <h4 className="nameUser">None</h4>
        </Main>
      )}
    </Wrapper>
  )
}

export default AccountListItem
