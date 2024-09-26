import React, { FC, useEffect, useState } from 'react'
import BsButton from 'react-bootstrap/Button'
import BsSpinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { MutationCreateDto, MutationDto, useCreateMutation, useEditMutation } from '@mweb/engine'
import { Image } from './image'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { Button } from './button'
import { MutationModalMode } from './types'
import { InputImage } from './upload-image'
import { cloneDeep } from '../../helpers'

const ModalConfirmWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  max-height: calc(100% - 40px);
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

const HeaderTitle = styled.h1`
  margin: 0;
  text-align: center;
  color: #02193a;
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  line-height: 150%;
`

const Label = styled.div`
  color: #7a818b;
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 700;
`

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const ImgWrapper = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
  }
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 52px);

  p {
    font-size: 14px;
    font-weight: 600;
    color: #02193a;
    margin: 0;
    overflow-wrap: break-word;
  }

  span {
    font-size: 10px;
    color: #7a818b;
    overflow-wrap: break-word;
  }
`

const FloatingLabelContainer = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 100%;
`

const StyledInput = styled.input`
  padding: 20px 10px 9px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 12px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  border: none;
`

const StyledLabel = styled.label`
  top: 0.5rem;
  left: 10px;
  font-size: 10px;
  color: #7a818b;
  position: absolute;
  user-select: none;

  span {
    color: #db504a;
  }
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

const StyledTextarea = styled.textarea`
  padding: 25px 10px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 13px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  min-height: 77px;
  position: relative;
  border: none;
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

const ButtonsBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    width: 125px;
  }
`

export interface Props {
  itemType: 'mutation' | 'document'
  mode: any
  isOwn: boolean
  onClose: () => void
  editingMutation: MutationCreateDto
  baseMutation: MutationDto | null
  mutationAuthorId: string
  loggedInAccountId: string
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
  noName: {
    id: 'noName',
    text: 'Name must be specified.',
    severity: 'error',
  },
  noImage: {
    id: 'noImage',
    text: 'Image must be specified.',
    severity: 'error',
  },
}

export const ModalConfirm: FC<Props> = ({
  itemType,
  mode,
  isOwn,
  onClose,
  editingMutation,
  baseMutation,
  mutationAuthorId,
  loggedInAccountId,
}) => {
  const { name, image, fork_of } = editingMutation.metadata
  // Close modal with escape key
  useEscape(onClose) // ToDo -- does not work
  const [title, setTitle] = useState<string>(name ?? '')
  const [newImage, setImage] = useState<{ ipfs_cid?: string } | undefined>(image)
  const [description, setDescription] = useState<string>('')
  const [alert, setAlert] = useState<IAlert | null>(null)

  // const checkForSubmit = (): boolean =>
  //   mode === MutationModalMode.Creating || mode === MutationModalMode.Forking
  //     ? !!title && !!newImage
  //     : true

  // const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(!checkForSubmit())
  const { createMutation, isLoading: isCreating } = useCreateMutation()
  const { editMutation, isLoading: isEditing } = useEditMutation()

  const isFormDisabled = isCreating || isEditing

  // useEffect(() => setIsSubmitDisabled(!checkForSubmit()), [title, newImage])

  useEffect(() => setAlert(null), [title, newImage])

  const doChecksForAlerts = (): IAlert | null => {
    if (!title) return alerts.noName
    if (!newImage || !newImage?.ipfs_cid) return alerts.noImage
    return null
  }

  // const checkIfModified = useCallback(
  //   () => !(baseMutation ? compareMutations(baseMutation, editingMutation) : false),
  //   [baseMutation, editingMutation]
  // )

  const handleSaveClick = async () => {
    const newAlert = doChecksForAlerts()
    if (newAlert) {
      setAlert(newAlert)
      return
    }
    console.log('editingMutation', editingMutation)

    const mutationToPublish = cloneDeep(editingMutation)

    // validate Name
    if (title.trim() === '') {
      setTitle('')
      return
    }

    mutationToPublish.metadata.name = title.trim()
    mutationToPublish.metadata.image = newImage
    mutationToPublish.metadata.description = description.trim()

    // validate changes -- ToDo ????
    // const hasChanges = checkIfModified()
    // if (!hasChanges) {
    //   setIsModified(false)
    //   return
    // }

    if (mode === MutationModalMode.Creating || mode === MutationModalMode.Forking) {
      try {
        await createMutation(mutationToPublish)
        onClose()
      } catch (error: any) {
        if (error?.message === 'Mutation with that ID already exists') {
          setAlert(alerts.idIsNotUnique)
        }
      }
    } else if (mode === MutationModalMode.Editing) {
      // editMutation(mutationToPublish).then(() => onClose()) - ToDo
      console.log('mutation to save', mutationToPublish)
    }
  }

  return (
    <ModalConfirmWrapper data-testid="popup-confirm">
      <HeaderTitle>
        {mode === MutationModalMode.Creating
          ? `Create your ${itemType}`
          : mode === MutationModalMode.Editing
          ? `Publish your ${itemType}`
          : mode === MutationModalMode.Forking
          ? 'Publish as a fork'
          : null}
      </HeaderTitle>

      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}

      {mode === MutationModalMode.Creating ? (
        <>
          <Label>My item ({loggedInAccountId})</Label>
          <CardWrapper>
            <InputImage
              ipfsCid={newImage?.ipfs_cid}
              onImageChange={async (ipfs_cid: string) => setImage({ ipfs_cid })}
              isDisabled={isFormDisabled}
            />
            <FloatingLabelContainer>
              <StyledInput
                id={'title'}
                type={'text'}
                value={title}
                placeholder={`Enter your ${itemType} name`}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'title'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={description}
              placeholder={`Describe your ${itemType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : mode === MutationModalMode.Forking ? (
        <>
          <Label>from</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={baseMutation?.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={baseMutation?.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{baseMutation?.metadata.name}</p>
              <span>by {isOwn ? `me (${loggedInAccountId})` : baseMutation?.authorId}</span>
            </TextWrapper>
          </CardWrapper>

          {isOwn ? null : (
            <CheckboxBlock>
              <span>Ask Origin to apply changes</span>
              <CheckboxInput
                type="checkbox"
                checked={true}
                disabled={isFormDisabled}
                onChange={
                  () => {}
                  // todo: need onChange
                }
              />
            </CheckboxBlock>
          )}
          <Label>As my item ({loggedInAccountId})</Label>
          <CardWrapper>
            <InputImage
              ipfsCid={newImage?.ipfs_cid}
              onImageChange={async (ipfs_cid: string) => setImage({ ipfs_cid })}
              isDisabled={isFormDisabled}
            />
            <FloatingLabelContainer>
              <StyledInput
                id={'title'}
                type={'text'}
                value={title}
                placeholder={`Enter your ${itemType} name`}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'title'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={description}
              placeholder={`Describe your ${itemType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : mode === MutationModalMode.Editing ? (
        <>
          <Label>My item</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={newImage}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={title} // ToDo: why?
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{title}</p>
              <span>{title}</span>
            </TextWrapper>
          </CardWrapper>

          {isOwn ? null : (
            <>
              <Label>Originally Forked from</Label>
              <CardWrapper>
                <ImgWrapper>
                  {/* todo: Originally Forked from Data */}
                  <Image
                    image={newImage}
                    fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                    alt={fork_of}
                  />
                </ImgWrapper>
                <TextWrapper>
                  <p>{fork_of}</p>
                  <span>{fork_of}</span>
                </TextWrapper>
              </CardWrapper>

              <CheckboxBlock>
                <span>Ask Origin to apply changes</span>
                <CheckboxInput
                  type="checkbox"
                  checked={true}
                  disabled={isFormDisabled}
                  onChange={
                    () => {}
                    // todo: need onChange
                  }
                />
              </CheckboxBlock>
            </>
          )}

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={description}
              placeholder={`Describe your ${itemType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      <ButtonsBlock>
        <Button onClick={onClose}>Cancel</Button>
        {!isFormDisabled ? (
          <BsButton onClick={handleSaveClick} variant="primary">
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
