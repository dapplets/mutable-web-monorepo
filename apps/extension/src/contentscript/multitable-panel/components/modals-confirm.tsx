import { Mutation, useMutableWeb } from '@mweb/engine'
import React, { FC, useState } from 'react'
import BsButton from 'react-bootstrap/Button'
import BsSpinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from './image'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { Button } from './button'

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
  background: #fff;
  width: 300px;
  max-height: 70vh;
  z-index: 5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  box-shadow: 0px 5px 11px 0px rgba(2, 25, 58, 0.1), 0px 19px 19px 0px rgba(2, 25, 58, 0.09),
    0px 43px 26px 0px rgba(2, 25, 58, 0.05), 0px 77px 31px 0px rgba(2, 25, 58, 0.01),
    0px 120px 34px 0px rgba(2, 25, 58, 0);

  input[type='checkbox'] {
    accent-color: #384bff;
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
  width: 100%;
  text-align: center;
`

const ButtonsBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    width: 125px;
  }
`

const ImgWrapper = styled.div`
  width: 42px;
  height: 42px;
  img {
    width: 100%;
    height: 100%;
  }
`

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 184px;
  p {
    font-size: 14px;
    font-weight: 600;
    color: #02193a;
    margin: 0;
  }
  span {
    font-size: 10px;
    color: #7a818b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const Label = styled.div`
  color: #7a818b;
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 700;
`

const FloatingLabelContainerArea = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  flex: 1 1 auto;
  display: flex;
  border-radius: 10px;
`
const StyledLabel = styled.label`
  font-size: 10px;
  color: #bbccd0;
  position: absolute;
`

const StyledTextarea = styled.textarea`
  padding: 25px 10px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 13px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  height: 110px;
  position: relative;
  border: none;

  &::-webkit-resizer {
    display: none;
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    height: 25px;
    width: 99%;
    background: inherit;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    top: 0;
    left: 10px;
    font-size: 12px;
  }
`

const CheckboxBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 12px;
    color: #02193a;
  }
`

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid #384bff;
`

const FloatingLabelContainer = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 184px;
`
const StyledInput = styled.input`
  padding: 20px 10px 10px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 12px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  border: none;

  &:focus + label,
  &:not(:placeholder-shown) + label {
    top: 0.5rem;
    font-size: 10px;
    color: #bbccd0;
    left: 10px;
  }
`

const PopupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M9.33301 10.5L12.833 7L9.33301 3.5"
      stroke="#7A818B"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4.66699 3.5L1.16699 7L4.66699 10.5"
      stroke="#7A818B"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
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

  console.log(editingMutation)

  return (
    <ModalConfirmWrapper data-testid="popup-confirm">
      <HeaderEditor>
        <HeaderTitle>
          {mode === MutationModalMode.Creating ? 'Create your item' : null}
          {mode === MutationModalMode.Editing ? 'Publish your item' : null}
          {mode === MutationModalMode.Forking ? 'Publish as a fork' : null}
        </HeaderTitle>
      </HeaderEditor>
      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}
      {mode === MutationModalMode.Creating ? (
        <>
          <Label>my Item</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingMutation.metadata.name}</p>
              <span>{editingMutation.id}</span>
            </TextWrapper>
            <div>
              <PopupIcon />
            </div>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={''}
              onChange={() => {
                // todo: onChange
              }}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      {mode === MutationModalMode.Forking ? (
        <>
          <Label>from</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingMutation.metadata.name}</p>
              <span>{editingMutation.id}</span>
            </TextWrapper>
            <div>
              <PopupIcon />
            </div>
          </CardWrapper>

          <CheckboxBlock>
            <span>Ask Origin to apply changes</span>
            <CheckboxInput
              type="checkbox"
              checked={true}
              onChange={
                () => {}
                // todo: need onChange
              }
            />
          </CheckboxBlock>
          <Label>As your item</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <FloatingLabelContainer>
              <StyledInput
                id={'title'}
                type={'text'}
                value={''}
                onChange={(e) => {
                  // todo: need onChange
                }}
              />
              <StyledLabel htmlFor={'title'}>Name</StyledLabel>
            </FloatingLabelContainer>
            <div>
              <PopupIcon />
            </div>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={''}
              onChange={() => {
                // todo: onChange
              }}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      {mode === MutationModalMode.Editing ? (
        <>
          <Label>my Item</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingMutation.metadata.name}</p>
              <span>{editingMutation.id}</span>
            </TextWrapper>
            <div>
              <PopupIcon />
            </div>
          </CardWrapper>

          <Label>Originally Forked from</Label>
          <CardWrapper>
            <ImgWrapper>
              {/* todo: Originally Forked from Data */}
              <Image
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingMutation.metadata.name}</p>
              <span>{editingMutation.id}</span>
            </TextWrapper>
            <div>
              <PopupIcon />
            </div>
          </CardWrapper>

          <CheckboxBlock>
            <span>Ask Origin to apply changes</span>
            <CheckboxInput
              type="checkbox"
              checked={true}
              onChange={
                () => {}
                // todo: need onChange
              }
            />
          </CheckboxBlock>
          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={''}
              onChange={() => {
                // todo: onChange
              }}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      <ButtonsBlock>
        <Button onClick={handleRevertClick}>Cancel</Button>
        {!isFormDisabled ? (
          <BsButton onClick={handleSaveClick} variant="primary" disabled>
            {mode === MutationModalMode.Forking ? 'Fork it!' : 'Do it!'}
          </BsButton>
        ) : (
          <BsButton variant="primary" disabled>
            <BsSpinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />{' '}
            Sending...
          </BsButton>
        )}
      </ButtonsBlock>
    </ModalConfirmWrapper>
  )
}
