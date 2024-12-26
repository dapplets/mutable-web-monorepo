import cn from 'classnames'
import React, { Dispatch, SetStateAction, useState } from 'react'
import styled from 'styled-components'
import { Arrow01 as DropdownIcon } from './assets/icons'
import { CAUserButton } from './connected-accounts-button'

const DropdownAccountsContainer = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  line-height: 149%;
  color: #919191;
  border-radius: 10px;

  .itemsContainer {
    position: absolute;
    z-index: 1;
    top: 100%;
    width: 100%;
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 20%));
  }

  .item > div {
    margin: 0;
    border-radius: 22px 0 0 22px;
  }

  .item:last-child > div {
    border-radius: 22px 0 14px 22px;
  }

  .dropdownLabel {
    cursor: default;
    width: 100%;

    &.clickable {
      cursor: pointer;
    }
  }

  .dropdownLabel > div:first-child {
    cursor: default;
    margin: 0;
  }

  .dropdownLabel.clickable > div:first-child {
    cursor: pointer;
  }

  .dropdownLabel.isOpen > div:first-child {
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 20%));
    border-radius: 22px 14px 0 22px;
  }

  .delimiterSpan {
    display: flex;
    justify-content: flex-start;
    width: 97%;
  }

  .openOverlay {
    position: absolute;
    z-index: 3;
    top: -1px;
    right: -1px;
    display: flex;
    flex-direction: column;
    width: 101%;
    height: auto;
    background: #ebebeb;
    border-radius: 10px;
    animation-name: list-visible;
    animation-duration: 0.2s;
    animation-timing-function: ease;
    animation-fill-mode: forwards;

    :last-child {
      border-radius: 0 0 10px 10px;
    }
  }

  .blockIcon {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .openList {
    position: absolute;
    right: 10px;
    display: block;
    padding: 0 10px;
    animation-name: rotate-is-close;
    animation-duration: 0.2s;
    animation-timing-function: ease;
    animation-fill-mode: forwards;

    &.isOpen {
      animation-name: rotate-is-open;
      animation-duration: 0.2s;
      animation-timing-function: ease;
      animation-fill-mode: forwards;
    }
  }

  @keyframes list-visible {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes rotate-is-open {
    0% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(180deg);
    }
  }

  @keyframes rotate-is-close {
    0% {
      transform: rotate(180deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }
`

type TDropdownAccountsProps = {
  values: any[] // ToDo: add types
  selected?: any // ToDo: add types
  setter: Dispatch<SetStateAction<any | null>>
  nameId: string
  originId: string
  maxLength?: number
}

export function DropdownAccounts(props: TDropdownAccountsProps) {
  const { values, selected, setter, nameId, originId, maxLength = 20 } = props
  const [isOpen, setOpen] = useState(false)

  return (
    <DropdownAccountsContainer
      onClick={() => values && values.length > 1 && setOpen(!isOpen)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          className={cn('dropdownLabel', {
            isOpen: isOpen,
            clickable: values && values.length > 1,
          })}
        >
          <CAUserButton
            user={
              selected && {
                img: '',
                name: selected[nameId],
                origin: selected[originId],
                accountActive: selected.accountActive,
              }
            }
            maxLength={maxLength}
            color="#eaf0f0"
          />
        </div>
        {values && values.length > 1 && (
          <span className={cn('openList', { isOpen: isOpen })}>
            <DropdownIcon />
          </span>
        )}
      </div>
      {isOpen && (
        <div className="itemsContainer">
          {values.length &&
            values
              .filter(
                (v) => !(v[nameId] === selected?.[nameId] && v[originId] === selected?.[originId])
              )
              .map((value) => (
                <div
                  className="item"
                  key={value[nameId]}
                  onClick={() => {
                    setter(value)
                    setOpen(!isOpen)
                  }}
                >
                  <CAUserButton
                    user={{
                      img: '',
                      name: value[nameId],
                      origin: value[originId],
                      accountActive: value['accountActive'],
                    }}
                    maxLength={maxLength}
                    color="#eaf0f0"
                  />
                </div>
              ))}
        </div>
      )}
    </DropdownAccountsContainer>
  )
}
