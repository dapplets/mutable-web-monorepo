import { EntitySourceType, MutationCreateDto, MutationDto } from '@mweb/backend'
import {
  useCreateMutation,
  useDeleteLocalMutation,
  useEditMutation,
  useMutations,
  useSetPreferredSource,
} from '@mweb/react-engine'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useEngine } from '../../contexts/engine-context'
import { cloneDeep } from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { Button } from './button'
import { ButtonsGroup } from './buttons-group'
import { DropdownButton } from './dropdown-button'
import { Image } from './image'
import { InputImage } from './upload-image'

enum MutationModalMode {
  Editing = 'editing',
  Creating = 'creating',
  Forking = 'forking',
}

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
  box-shadow:
    0px 5px 11px 0px rgba(2, 25, 58, 0.1),
    0px 19px 19px 0px rgba(2, 25, 58, 0.09),
    0px 43px 26px 0px rgba(2, 25, 58, 0.05),
    0px 77px 31px 0px rgba(2, 25, 58, 0.01),
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

export interface Props {
  itemType: 'mutation' | 'document'
  onCloseCurrent: () => void
  onCloseAll: () => void
  editingMutation: MutationDto
  loggedInAccountId: string
}

interface IAlert extends AlertProps {
  id: string
}

// ToDo: duplication -- move somewhere
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
  onCloseCurrent,
  onCloseAll,
  editingMutation,
  loggedInAccountId,
}) => {
  const { name, image, description, fork_of } = editingMutation.metadata

  // Close modal with escape key
  useEscape(onCloseCurrent) // ToDo -- does not work

  const [newName, setName] = useState<string>(name ?? '')
  const [newImage, setImage] = useState<{ ipfs_cid?: string } | undefined>(image)
  const [newDescription, setDescription] = useState<string>(description ?? '')
  const [isApplyToOriginChecked, setIsApplyToOriginChecked] = useState<boolean>(false) // ToDo: separate checkboxes
  const [alert, setAlert] = useState<IAlert | null>(null)
  const { mutations } = useMutations()
  const { onSwitchMutation, tree } = useEngine()
  const { setPreferredSource } = useSetPreferredSource()

  const [mode, setMode] = useState(
    !editingMutation.authorId // Newly created local mutation doesn't have author
      ? MutationModalMode.Creating
      : editingMutation.authorId === loggedInAccountId
        ? MutationModalMode.Editing
        : MutationModalMode.Forking
  )

  const forkedMutation = useMemo(() => {
    if (mode !== MutationModalMode.Editing || !fork_of) return null
    return mutations.find((mutation) => mutation.id === fork_of)
  }, [fork_of, mutations, mode])

  const { createMutation, isLoading: isCreating } = useCreateMutation()
  const { editMutation, isLoading: isEditing } = useEditMutation()
  const { deleteLocalMutation } = useDeleteLocalMutation()

  const isFormDisabled = isCreating || isEditing

  useEffect(() => setAlert(null), [newName, newImage, newDescription, isApplyToOriginChecked])

  // const checkIfModified = useCallback(
  //   (mutationToPublish: MutationDto) =>
  //     baseMutation ? !compareMutations(baseMutation, mutationToPublish) : true,
  //   [baseMutation]
  // )

  const doChecksForAlerts = useCallback(
    (mutationToPublish: MutationCreateDto | MutationDto, isEditing: boolean): IAlert | null => {
      if (!mutationToPublish.metadata.name) return alerts.noName
      if (!mutationToPublish.metadata.image) return alerts.noImage
      // if (
      //   isEditing &&
      //   !isApplyToOriginChecked &&
      //   !checkIfModified(mutationToPublish as MutationDto)
      // )
      //   return alerts.notEditedMutation
      return null
    },
    [newName, newImage, isApplyToOriginChecked] // checkIfModified
  )

  const handleSaveClick = async () => {
    const mutationToPublish = cloneDeep(editingMutation)
    mutationToPublish.metadata.name = newName.trim()
    mutationToPublish.metadata.image = newImage
    mutationToPublish.metadata.description = newDescription.trim()
    mutationToPublish.source = EntitySourceType.Origin // save to the contract

    if (mode === MutationModalMode.Forking) {
      mutationToPublish.metadata.fork_of = mutationToPublish.id
    }

    const newAlert = doChecksForAlerts(mutationToPublish, mode === MutationModalMode.Editing)
    if (newAlert) {
      setAlert(newAlert)
      return
    }

    const hostname = tree?.id

    if (!hostname) throw new Error('No root context ID found')

    if (mode === MutationModalMode.Creating || mode === MutationModalMode.Forking) {
      try {
        const createdMutation = await createMutation(
          mutationToPublish,
          mode === MutationModalMode.Forking
            ? { askOriginToApplyChanges: isApplyToOriginChecked }
            : undefined
        )
        onSwitchMutation(createdMutation.id)
        setPreferredSource(createdMutation.id, hostname, EntitySourceType.Origin)
        await deleteLocalMutation(mutationToPublish.id)
        onCloseAll()
      } catch (error: any) {
        if (error?.message === 'Mutation with that ID already exists') {
          setAlert(alerts.idIsNotUnique)
        }
      }
    } else if (mode === MutationModalMode.Editing) {
      try {
        await editMutation(
          mutationToPublish as MutationDto,
          forkedMutation && isApplyToOriginChecked
            ? forkedMutation.authorId === loggedInAccountId
              ? { applyChangesToOrigin: true }
              : { askOriginToApplyChanges: true }
            : undefined
        )
        setPreferredSource(mutationToPublish.id, hostname, EntitySourceType.Origin)
        await deleteLocalMutation(mutationToPublish.id)
        onCloseAll()
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleSaveDropdownChange = (itemId: string) => {
    setMode(itemId as MutationModalMode)
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
                id={'name'}
                type={'text'}
                value={newName}
                placeholder={`Enter your ${itemType} name`}
                onChange={(e) => setName(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'name'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
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
                image={editingMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingMutation.metadata.name}</p>
              <span>
                by{' '}
                {editingMutation.authorId === loggedInAccountId
                  ? `me (${loggedInAccountId})`
                  : editingMutation.authorId}
              </span>
            </TextWrapper>
          </CardWrapper>

          {editingMutation.authorId === loggedInAccountId ? null : (
            <CheckboxBlock>
              <span>Ask Origin to apply changes</span>
              <CheckboxInput
                type="checkbox"
                checked={isApplyToOriginChecked}
                disabled={isFormDisabled}
                onChange={() => setIsApplyToOriginChecked((val) => !val)}
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
                id={'name'}
                type={'text'}
                value={newName}
                placeholder={`Enter your ${itemType} name`}
                onChange={(e) => setName(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'name'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
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
                alt={newName} // ToDo: why?
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{newName}</p>
              <span>by me ({loggedInAccountId})</span>
            </TextWrapper>
          </CardWrapper>

          {forkedMutation ? (
            <>
              <Label>Originally Forked from</Label>
              <CardWrapper>
                <ImgWrapper>
                  <Image
                    image={forkedMutation.metadata.image}
                    fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                    alt={forkedMutation.metadata.name}
                  />
                </ImgWrapper>
                <TextWrapper>
                  <p>{forkedMutation.metadata.name}</p>
                  <span>
                    by{' '}
                    {forkedMutation.authorId === loggedInAccountId
                      ? `me (${loggedInAccountId})`
                      : forkedMutation.authorId}
                  </span>
                </TextWrapper>
              </CardWrapper>

              <CheckboxBlock>
                <span>
                  {forkedMutation.authorId === loggedInAccountId
                    ? 'Apply changes to Origin'
                    : 'Ask Origin to apply changes'}
                </span>
                <CheckboxInput
                  type="checkbox"
                  checked={isApplyToOriginChecked}
                  disabled={isFormDisabled}
                  onChange={() => setIsApplyToOriginChecked((val) => !val)}
                />
              </CheckboxBlock>
            </>
          ) : null}

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
              placeholder={`Describe your ${itemType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      <ButtonsGroup>
        <Button onClick={onCloseCurrent}>Cancel</Button>
        <DropdownButton
          value={mode}
          items={[
            {
              value: MutationModalMode.Forking,
              title: 'Fork',
              visible: !!editingMutation.authorId,
            },
            {
              value: MutationModalMode.Editing,
              title: 'Save',
              visible: !!editingMutation.authorId && editingMutation.authorId === loggedInAccountId,
            },
            {
              value: MutationModalMode.Creating,
              title: 'Create',
              visible: !editingMutation.authorId,
            },
          ]}
          onClick={handleSaveClick}
          onChange={handleSaveDropdownChange}
          disabled={isFormDisabled}
          disabledAll={isFormDisabled}
        />
      </ButtonsGroup>
    </ModalConfirmWrapper>
  )
}
