import { EntitySourceType, MutationCreateDto, MutationDto } from '@mweb/backend'
import {
  useCreateMutation,
  useDeleteLocalMutation,
  useEditMutation,
  useMutableWeb,
} from '@mweb/engine'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { cloneDeep } from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { AlertProps } from './alert'
import { ModalsConfirm, ModalMode } from './modals-confirm'

export interface Props {
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

export const ModalConfirmMutation: FC<Props> = ({
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
  const { mutations, switchMutation, switchPreferredSource } = useMutableWeb()

  const [mode, setMode] = useState(
    !editingMutation.authorId // Newly created local mutation doesn't have author
      ? ModalMode.Creating
      : editingMutation.authorId === loggedInAccountId
      ? ModalMode.Editing
      : ModalMode.Forking
  )

  const forkedMutation = useMemo(() => {
    if (mode !== ModalMode.Editing || !fork_of) return
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

    if (mode === ModalMode.Forking) {
      mutationToPublish.metadata.fork_of = mutationToPublish.id
    }

    const newAlert = doChecksForAlerts(mutationToPublish, mode === ModalMode.Editing)
    if (newAlert) {
      setAlert(newAlert)
      return
    }

    if (mode === ModalMode.Creating || mode === ModalMode.Forking) {
      try {
        const id = await createMutation(
          mutationToPublish,
          mode === ModalMode.Forking
            ? { askOriginToApplyChanges: isApplyToOriginChecked }
            : undefined
        )
        switchMutation(id)
        switchPreferredSource(id, EntitySourceType.Origin)
        await deleteLocalMutation(mutationToPublish.id)
        onCloseAll()
      } catch (error: any) {
        if (error?.message === 'Mutation with that ID already exists') {
          setAlert(alerts.idIsNotUnique)
        }
      }
    } else if (mode === ModalMode.Editing) {
      try {
        await editMutation(
          mutationToPublish as MutationDto,
          forkedMutation && isApplyToOriginChecked
            ? forkedMutation.authorId === loggedInAccountId
              ? { applyChangesToOrigin: true }
              : { askOriginToApplyChanges: true }
            : undefined
        )
        switchPreferredSource(mutationToPublish.id, EntitySourceType.Origin)
        await deleteLocalMutation(mutationToPublish.id)
        onCloseAll()
      } catch (error: any) {
        console.error(error)
      }
    }
  }

  const handleChangeModalMode = (itemId: string) => {
    setMode(itemId as ModalMode)
  }

  return (
    <ModalsConfirm
      entityType="mutation"
      editingEntity={editingMutation}
      loggedInAccountId={loggedInAccountId}
      mode={mode}
      alert={alert}
      isFormDisabled={isFormDisabled}
      isApplyToOriginChecked={isApplyToOriginChecked}
      newName={newName}
      newImage={newImage}
      newDescription={newDescription}
      forkedEntity={forkedMutation}
      onChangeModalMode={handleChangeModalMode}
      setIsApplyToOriginChecked={setIsApplyToOriginChecked}
      setName={setName}
      setImage={setImage}
      setDescription={setDescription}
      onSaveClick={handleSaveClick}
      onCloseCurrent={onCloseCurrent}
    />
  )
}
