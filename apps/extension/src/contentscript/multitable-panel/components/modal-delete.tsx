import React, { FC } from 'react'
import styled from 'styled-components'
import { useEscape } from '../../hooks/use-escape'
import { Button } from './button'
import { ButtonsGroup } from './buttons-group'

const ModalConfirmWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  padding: 20px;
  gap: 10px;
  border-radius: 10px;
  z-index: 5;
  background: #fff;
  box-shadow: 0px 5px 11px 0px rgba(2, 25, 58, 0.1), 0px 19px 19px 0px rgba(2, 25, 58, 0.09),
    0px 43px 26px 0px rgba(2, 25, 58, 0.05), 0px 77px 31px 0px rgba(2, 25, 58, 0.01),
    0px 120px 34px 0px rgba(2, 25, 58, 0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

  input[type='checkbox'] {
    accent-color: #384bff;
  }
`

const Title = styled.h1`
  margin: 0;
  text-align: center;
  color: #02193a;
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  line-height: 150%;
`

const Message = styled.p`
  margin: 0;
  text-align: center;
  color: #02193a;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 150%;
`

export interface Props {
  onAction: () => void
  onCloseCurrent: () => void
}

export const ModalDelete: FC<Props> = ({ onAction, onCloseCurrent }) => {
  useEscape(onCloseCurrent)
  return (
    <ModalConfirmWrapper data-testid="popup-confirm">
      <Title>Delete local mutation</Title>
      <Message>You're going to delete the local mutation.</Message>
      <ButtonsGroup>
        <Button onClick={onCloseCurrent}>Cancel</Button>
        <Button danger onClick={onAction}>
          Delete
        </Button>
      </ButtonsGroup>
    </ModalConfirmWrapper>
  )
}
