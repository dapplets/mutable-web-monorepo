import { AppId, BaseDto, DocumentMetadata, MutationCreateDto, MutationDto } from '@mweb/backend'
import {
  useAppDocuments,
  useCreateMutation,
  useDeleteLocalMutation,
  useDocument,
  useEditMutation,
} from '@mweb/engine'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { cloneDeep } from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { AlertProps } from './alert'
import { ModalsConfirm, ModalMode } from './modals-confirm'

export interface Props {
  editingDocument: BaseDto & {
    metadata: DocumentMetadata
    openWith: AppId[]
    content: any
  }
  loggedInAccountId: string
  onCloseCurrent: () => void
  onCloseAll: () => void
}

interface IAlert extends AlertProps {
  id: string
}

// ToDo: duplication -- move somewhere
const alerts: { [name: string]: IAlert } = {
  noWallet: {
    id: 'noWallet',
    text: 'Connect the NEAR wallet to create the document.',
    severity: 'warning',
  },
  emptyDocument: {
    id: 'emptyDocument',
    text: 'A document cannot be empty.',
    severity: 'warning',
  },
  notEditedDocument: {
    id: 'notEditedDocument',
    text: 'No changes found!',
    severity: 'warning',
  },
  idIsNotUnique: {
    id: 'idIsNotUnique',
    text: 'This document ID already exists.',
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

export const ModalConfirmDocument: FC<Props> = ({
  editingDocument,
  loggedInAccountId,
  onCloseCurrent,
  onCloseAll,
}) => {
  const { name, image, description, fork_of } = editingDocument.metadata

  // Close modal with escape key
  useEscape(onCloseCurrent) // ToDo -- does not work

  const [newName, setName] = useState<string>(name ?? '')
  const [newImage, setImage] = useState<{ ipfs_cid?: string } | undefined>(image)
  const [newDescription, setDescription] = useState<string>(description ?? '')
  const [isApplyToOriginChecked, setIsApplyToOriginChecked] = useState<boolean>(false) // ToDo: separate checkboxes
  const [alert, setAlert] = useState<IAlert | null>(null)
  const appDocuments = editingDocument.openWith && useAppDocuments(editingDocument.openWith[0]) // ToDo: need to change when different apps could use same documents

  const [mode, setMode] = useState(
    !editingDocument.authorId // Newly created local document doesn't have author
      ? ModalMode.Creating
      : editingDocument.authorId === loggedInAccountId
      ? ModalMode.Editing
      : ModalMode.Forking
  )

  const forkedDocument = useMemo(() => {
    if (mode !== ModalMode.Editing || !fork_of || !appDocuments) return
    return appDocuments.documents?.find((doc) => doc.id === fork_of)
  }, [fork_of, appDocuments, mode])

  const { createMutation, isLoading: isCreating } = useCreateMutation()
  const { editMutation, isLoading: isEditing } = useEditMutation()
  const { deleteLocalMutation } = useDeleteLocalMutation()
  const { documentTask, resolveDocumentTask } = useDocument()

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
    if (!documentTask) return
    console.log('handleSaveClick')
    const documentToPublish = cloneDeep(editingDocument)
    documentToPublish.metadata.name = newName.trim()
    documentToPublish.metadata.image = newImage
    documentToPublish.metadata.description = newDescription.trim()
    resolveDocumentTask(documentToPublish)
    // mutationToPublish.source = EntitySourceType.Origin // save to the contract
    // if (mode === ModalMode.Forking) {
    //   mutationToPublish.metadata.fork_of = mutationToPublish.id
    // }
    // const newAlert = doChecksForAlerts(mutationToPublish, mode === ModalMode.Editing)
    // if (newAlert) {
    //   setAlert(newAlert)
    //   return
    // }
    // if (mode === ModalMode.Creating || mode === ModalMode.Forking) {
    //   try {
    //     const id = await createMutation(
    //       mutationToPublish,
    //       mode === ModalMode.Forking
    //         ? { askOriginToApplyChanges: isApplyToOriginChecked }
    //         : undefined
    //     )
    //     switchMutation(id)
    //     switchPreferredSource(id, EntitySourceType.Origin)
    //     await deleteLocalMutation(mutationToPublish.id)
    //     onCloseAll()
    //   } catch (error: any) {
    //     if (error?.message === 'Mutation with that ID already exists') {
    //       setAlert(alerts.idIsNotUnique)
    //     }
    //   }
    // } else if (mode === ModalMode.Editing) {
    //   try {
    //     await editMutation(
    //       mutationToPublish as MutationDto,
    //       forkedMutation && isApplyToOriginChecked
    //         ? forkedMutation.authorId === loggedInAccountId
    //           ? { applyChangesToOrigin: true }
    //           : { askOriginToApplyChanges: true }
    //         : undefined
    //     )
    //     switchPreferredSource(mutationToPublish.id, EntitySourceType.Origin)
    //     await deleteLocalMutation(mutationToPublish.id)
    //     onCloseAll()
    //   } catch (error: any) {
    //     console.error(error)
    //   }
    // }
  }

  const handleChangeModalMode = (itemId: string) => {
    setMode(itemId as ModalMode)
  }

  return (
    <ModalsConfirm
      entityType="document"
      editingEntity={editingDocument}
      loggedInAccountId={loggedInAccountId}
      mode={mode}
      alert={alert}
      isFormDisabled={isFormDisabled}
      isApplyToOriginChecked={isApplyToOriginChecked}
      newName={newName}
      newImage={newImage}
      newDescription={newDescription}
      forkedEntity={forkedDocument}
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
