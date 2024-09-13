import { Mutation, useMutableWeb } from '@mweb/engine'

import React, { FC, useState } from 'react'
import BsButton from 'react-bootstrap/Button'
import BsSpinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from './image'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { Button } from './button'

import { Input } from './input'

const ModalConfirmWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  gap: 10px;
  border-radius: 10px;
  font-family: sans-serif;
  border: 1px solid #02193a;
  background: #f8f9ff;
  width: 400px;
  max-height: 70vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
`

const Close = styled.span`
  cursor: pointer;
  svg {
    margin: 0;
  }
  &:hover {
    opacity: 0.5;
  }
`

const HeaderEditor = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(2, 25, 58, 1);
  font-size: 18px;
  font-weight: 600;
  line-height: 21.09px;
  text-align: left;
  gap: 20px;

  .edit {
    margin-right: auto;
    margin-bottom: 2px;
  }
`

const HeaderTitle = styled.div`
  color: #02193a;
`

const AppsList = styled.div`
  overflow: hidden;
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    cursor: pointer;
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(244 244 244);
    background: linear-gradient(
      90deg,
      rgb(244 244 244 / 0%) 10%,
      rgb(227 227 227 / 100%) 50%,
      rgb(244 244 244 / 0%) 90%
    );
  }

  &::-webkit-scrollbar-thumb {
    width: 4px;
    height: 2px;
    background: #384bff;
    border-radius: 2px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 9%), 0 2px 2px rgb(38 117 209 / 4%);
  }
`

const ButtonsBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BlurredBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(255 255 255 / 75%);
  backdrop-filter: blur(5px);
  border-radius: 9px;
  z-index: 3;
`

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path
      d="M21 9L9 21"
      stroke="#02193A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L21 21"
      stroke="#02193A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface Props {
  mode: any
  onClose: () => void
  imgCid?: string
  editingMutation: Mutation
  handleRevertClick: any
  isFormDisabled: boolean
  handleSaveClick: any
}

export enum MutationModalMode {
  Editing = 'editing',
  Creating = 'creating',
  Forking = 'forking',
}

interface IAlert extends AlertProps {
  id: string
}

const alerts: { [name: string]: IAlert } = {
  noWallet: {
    id: 'noWallet',
    text: 'Connect the NEAR wallet to create the mutation.',
    severity: 'warning',
  },
  emptyMutation: {
    id: 'emptyMutation',
    text: 'A mutation cannot be empty.',
    severity: 'warning',
  },
  notEditedMutation: {
    id: 'notEditedMutation',
    text: 'No changes found!',
    severity: 'warning',
  },
  idIsNotUnique: {
    id: 'idIsNotUnique',
    text: 'This mutation ID already exists.',
    severity: 'warning',
  },
  noId: {
    id: 'noId',
    text: 'ID must be specified.',
    severity: 'error',
  },
  noName: {
    id: 'noName',
    text: 'Name must be specified.',
    severity: 'error',
  },
}

export const ModalConfirm: FC<Props> = ({
  mode,
  onClose,
  imgCid,
  editingMutation,
  handleRevertClick,
  isFormDisabled,
  handleSaveClick,
}) => {
  // Close modal with escape key
  useEscape(onClose)
  const [alert, setAlert] = useState<IAlert | null>(null)
  const { engine } = useMutableWeb()

  return (
    <ModalConfirmWrapper data-testid="popup-confirm">
      <HeaderEditor>
        <HeaderTitle>
          {mode === MutationModalMode.Creating ? 'Create your item' : null}
          {mode === MutationModalMode.Editing ? 'Publish your item' : null}
          {mode === MutationModalMode.Forking ? 'Publish as a fork' : null}
        </HeaderTitle>
        <Close onClick={onClose}>
          <CloseIcon />
        </Close>
      </HeaderEditor>

      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}
      <Image
        image={editingMutation.metadata.image}
        fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
        alt={editingMutation.metadata.name}
      />
      <Input
        label="Mutation ID"
        value={editingMutation.id}
        placeholder="dapplets.near/mutation/web"
        readonly
      />

      <Input
        label="Mutation Name"
        value={editingMutation.metadata.name ?? ''}
        placeholder="My Mutation"
        readonly
      />

      <ButtonsBlock>
        <Button onClick={handleRevertClick}>Cancel</Button>
        {!isFormDisabled ? (
          <BsButton
            onClick={handleSaveClick}
            style={{ width: 175, height: 42, borderRadius: 10 }}
            variant="primary"
            disabled
          >
            Do it!
          </BsButton>
        ) : (
          <BsButton style={{ width: 175, height: 42, borderRadius: 10 }} variant="primary" disabled>
            <BsSpinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />{' '}
            Sending...
          </BsButton>
        )}
      </ButtonsBlock>
    </ModalConfirmWrapper>
  )
}
