import React, { FC } from 'react'
import styled from 'styled-components'
import { Link as LinkIcon } from './assets/icons'

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 12px !important;
  font-weight: 400;
  line-height: 150%;
  text-align: center;
  cursor: pointer;
  padding: 1px 8px !important;
  gap: 6px;
  border-radius: 7px !important;
  transition: var(--transition-default);

  &:hover {
    background: var(--primary-hover);
  }

  &:active {
    background: var(--primary-pressed);
  }

  &:disabled {
    cursor: default;
    background-color: var(--main-grey);
  }
`

type LinkButtonProps = {
  onClick: () => void
  disabled?: boolean
}

const LinkButton: FC<LinkButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button disabled={disabled} onClick={onClick}>
      <LinkIcon />
      Link
    </Button>
  )
}

export default LinkButton
