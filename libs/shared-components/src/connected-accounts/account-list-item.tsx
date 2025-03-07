import cn from 'classnames'
import React, { FC, ReactElement } from 'react'
import styled from 'styled-components'
import PictureIcon from './assets/resources/picture'
import { resources } from './resources'

const Wrapper = styled.div<{ $hasMessage?: boolean; $bgColor?: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ $hasMessage }) => ($hasMessage ? '4px' : '0')};
  border-radius: 12px;
  background-color: ${({ $bgColor }) => ($bgColor ? $bgColor : 'var(--pure-white)')};
  font-family: var(--font-default);
  padding: 4px 10px !important;
  transition: gap 0.1s ease;
  width: 100%;
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

    color: rgba(122, 129, 139, 1);

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
    flex-grow: 1;
    font-size: 14px;
    font-weight: 400;
    font-style: normal;
    display: flex;
    align-items: center;
    overflow: hidden;

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
`

const Text = styled.p<{ $type: string }>`
  font-family: var(--font-default);
  color: ${(props) =>
    props.$type === 'error' || props.$type === 'warning' ? 'var(--error)' : 'var(--gray)'};
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
  transition:
    height 0.3s ease,
    transform 0.1s ease;
  height: ${(props) =>
    props.$type === 'error' ? 'auto' : props.$type === 'warning' ? '36px' : '0'};
  transform: ${(props) =>
    props.$type === 'error' || props.$type === 'warning' ? 'scaleY(1)' : 'scaleY(0)'};
`

type AccountListItemProps = {
  children?: ReactElement | ReactElement[] | null | (ReactElement | null)[]
  name?: string
  origin?: string
  disabled?: boolean
  isActive?: boolean
  message?: { text: string; type: string }
  bgColor?: string
}

const AccountListItem: FC<AccountListItemProps> = ({
  children,
  name,
  origin,
  disabled,
  isActive,
  message,
  bgColor,
}) => {
  const ResourceIcon = (origin && resources[origin]?.icon) || null
  return (
    <Wrapper $bgColor={bgColor} $hasMessage={!!message}>
      {name ? (
        <>
          <Main $disabled={disabled}>
            <div className="imgUser">{ResourceIcon ? <ResourceIcon /> : <PictureIcon />}</div>
            <div className="nameUser">
              <h4 style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{name.slice(0, -5)}</h4>
              <h4>{name.slice(-5)}</h4>
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
