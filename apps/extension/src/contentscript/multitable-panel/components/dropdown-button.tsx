import React, { FC, useMemo, useState } from 'react'
import styled from 'styled-components'

const DropdownWrapper = styled.div`
  position: relative;
`

const LeftButton = styled.button`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: rgba(56, 75, 255, 1);
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20.86px;
  text-align: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: auto;
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:active:not(:disabled) {
    opacity: 0.5;
  }
`

const TextSave = styled.div`
  display: inline-block;
  overflow: hidden;
  word-wrap: no-wrap;
  text-overflow: ellipsis;
  width: 100%;
  padding: 0 10px;
  text-align: center;
`

const RightButton = styled.button<{ isOpened: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(56, 75, 255, 1);
  cursor: pointer;
  transform: ${(props) => (props.isOpened ? 'rotate(180deg)' : 'rotate(0deg)')};

  &:disabled {
    opacity: 0.5;
    cursor: auto;
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:active:not(:disabled) {
    opacity: 0.5;
  }
`

const ItemGroup = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  right: 0;
  top: 52px;
  width: 175px;
  padding: 10px;
  gap: 5px;
  border-radius: 10px;
  background: rgba(231, 236, 239, 1);
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  color: rgba(34, 34, 34, 1);
`

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
    <path
      d="M1 1L7 7L13 1"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const DropdownButtonItem = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 31px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: rgba(217, 222, 225, 1);
    color: rgba(56, 75, 255, 1);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  width: 175px;
  height: 42px;
  border-radius: 10px;
  overflow: hidden;
`

type ItemProps = { value: string; title: string; visible?: boolean }

export interface Props {
  value: string
  items: ItemProps[]
  onClick: (itemId: string) => void
  onChange: (itemId: string) => void
  disabled: boolean
  disabledAll: boolean
}

export const DropdownButton: FC<Props> = ({
  value,
  items,
  disabled,
  disabledAll,
  onClick,
  onChange,
}) => {
  const [isOpened, setIsOpened] = useState(false)

  const visibleItems = useMemo(() => items.filter((item) => item.visible), [items])

  const currentItem = useMemo(
    () => visibleItems.find((item) => item.value === value),
    [visibleItems, value]
  )

  if (!currentItem) {
    throw new Error(`Invalid value: ${value}`)
  }

  const handleDropdownToggle = () => {
    setIsOpened((val) => !val)
  }

  const handleButtonItemClick = (item: ItemProps) => {
    onChange(item.value)
    handleDropdownToggle()
  }

  const handleMainButtonClick = () => {
    onClick(currentItem.value)
  }

  return (
    <DropdownWrapper>
      <ButtonGroup>
        <LeftButton disabled={disabled}>
          <TextSave onClick={handleMainButtonClick}>{currentItem.title}</TextSave>
        </LeftButton>
        {visibleItems.length > 1 ? (
          <RightButton disabled={disabledAll} isOpened={isOpened} onClick={handleDropdownToggle}>
            <ArrowIcon />
          </RightButton>
        ) : null}
      </ButtonGroup>

      {isOpened ? (
        <ItemGroup>
          {visibleItems.map((item) => (
            <DropdownButtonItem key={item.value} onClick={() => handleButtonItemClick(item)}>
              {item.title}
            </DropdownButtonItem>
          ))}
        </ItemGroup>
      ) : null}
    </DropdownWrapper>
  )
}
