import {
  AppMetadata,
  Mutation,
  useCreateMutation,
  useEditMutation,
  useMutableWeb,
} from '@mweb/engine'
import { useAccountId } from 'near-social-vm'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import BsButton from 'react-bootstrap/Button'
import BsSpinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import {
  cloneDeep,
  compareMutations,
  generateRandomHex,
  isValidSocialIdCharacters,
  mergeDeep,
} from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { ApplicationCardWithDocs, SimpleApplicationCard } from './application-card'
import { Button } from './button'
import { DropdownButton } from './dropdown-button'
import { Input } from './input'
import { InputImage } from './upload-image'
import { DocumentsModal } from './documents-modal'
import { AppInMutation } from '@mweb/engine/lib/app/services/mutation/mutation.entity'

const SelectedMutationEditorWrapper = styled.div`
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
  overflow: hidden;
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

const createEmptyMutation = (accountId: string): Mutation => ({
  id: `${accountId}/mutation/Untitled-${generateRandomHex(6)}`,
  apps: [],
  metadata: {
    name: '',
  },
  targets: [
    {
      namespace: 'engine',
      contextType: 'website',
      if: { id: { in: [window.location.hostname] } },
    },
  ],
})

export interface Props {
  apps: AppMetadata[]
  baseMutation: Mutation | null
  onClose: () => void
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

export const MutationEditorModal: FC<Props> = ({ baseMutation, apps, onClose }) => {
  console.log('baseMutation', baseMutation)
  console.log('apps', apps)
  const loggedInAccountId = useAccountId()
  const { createMutation, isLoading: isCreating } = useCreateMutation()
  const { editMutation, isLoading: isEditing } = useEditMutation()
  const { mutations } = useMutableWeb()
  const [isModified, setIsModified] = useState(true)
  const [appIdToOpenDocsModal, setAppIdToOpenDocsModal] = useState<string | null>(null)

  // Close modal with escape key
  useEscape(onClose)

  const preOriginalMutation = useMemo(
    () => baseMutation ?? createEmptyMutation(loggedInAccountId ?? 'dapplets.near'),
    [baseMutation, loggedInAccountId]
  )

  // ToDo: refactor it.
  // Too much mutations: baseMutation, preOriginalMutation, originalMutation, editingMutation
  const [originalMutation, setOriginalMutation] = useState(preOriginalMutation)
  const [editingMutation, setEditingMutation] = useState(originalMutation)
  console.log('editingMutation', editingMutation)

  const [mutationAuthorId] = preOriginalMutation.id.split('/')
  const isOwn = mutationAuthorId === loggedInAccountId

  const [mode, setMode] = useState(
    !baseMutation
      ? MutationModalMode.Creating
      : isOwn
      ? MutationModalMode.Editing
      : MutationModalMode.Forking
  )

  useEffect(() => {
    // Replace ID when forking
    if (mode === MutationModalMode.Forking && loggedInAccountId) {
      const [, , mutLocalId] = preOriginalMutation.id.split('/')
      const newId = `${loggedInAccountId}/mutation/${mutLocalId}`
      setOriginalMutation(mergeDeep(cloneDeep(preOriginalMutation), { id: newId }))
    } else {
      setOriginalMutation(preOriginalMutation)
    }
  }, [preOriginalMutation, mode, loggedInAccountId])

  useEffect(() => setEditingMutation(originalMutation), [originalMutation])

  const checkIfModified = useCallback(
    () => !(baseMutation ? compareMutations(baseMutation, editingMutation) : false),
    [baseMutation, editingMutation]
  )

  const [alert, setAlert] = useState<IAlert | null>(null)

  useEffect(() => {
    const doChecksForAlerts = (): IAlert | null => {
      if (!loggedInAccountId) return alerts.noWallet
      if (!editingMutation?.apps || editingMutation?.apps?.length === 0) return alerts.emptyMutation
      if (!editingMutation.id) return alerts.noId
      if (!editingMutation.metadata.name) return alerts.noName
      if (
        (mode === MutationModalMode.Forking || mode === MutationModalMode.Creating) &&
        mutations.map((m) => m.id).includes(editingMutation.id)
      )
        return alerts.idIsNotUnique
      return null
    }
    setIsModified(true)
    setAlert(doChecksForAlerts())
  }, [loggedInAccountId, editingMutation, mode, mutations])

  useEffect(() => {
    setAlert((val) => {
      if (!isModified) return alerts.notEditedMutation
      return !val || val?.id === 'notEditedMutation' ? null : val
    })
  }, [isModified])

  const isFormDisabled = isCreating || isEditing
  const isSubmitDisabled = !isModified || isCreating || isEditing || !!alert

  const handleMutationIdChange = (id: string) => {
    if (!isValidSocialIdCharacters(id)) return
    if (!id.startsWith(`${loggedInAccountId}/mutation/`)) return
    setEditingMutation((mut) => mergeDeep(cloneDeep(mut), { id }))
  }

  const handleMutationNameChange = (name: string) => {
    setEditingMutation((mut) => mergeDeep(cloneDeep(mut), { metadata: { name } }))
  }

  const handleMutationImageChange = async (cid: string) => {
    setEditingMutation((mut) =>
      mergeDeep(cloneDeep(mut), { metadata: { image: { ipfs_cid: cid } } })
    )
  }

  const handleAppCheckboxChange = (appId: string, checked: boolean) => {
    setEditingMutation((mut) => {
      const apps = checked
        ? [...mut.apps, { appId, documentId: null }]
        : mut.apps.filter((app) => app.appId !== appId)
      return mergeDeep(cloneDeep(mut), { apps })
    })
  }

  const handleDocCheckboxChange = (docId: string, appId: string, checked: boolean) => {
    setEditingMutation((mut) => {
      const apps = checked
        ? [...mut.apps, { appId, documentId: docId }]
        : mut.apps.filter((app) => app.appId !== appId || app.documentId !== docId)
      return mergeDeep(cloneDeep(mut), { apps })
    })
  }

  const handleDocCheckboxBanchChange = (docIds: (string | null)[], appId: string) => {
    setEditingMutation((mut) => {
      const docIdsToAdd = new Set<string | null>(docIds)
      const apps = mut.apps.filter((_app) => {
        if (_app.appId === appId) {
          if (docIdsToAdd.has(_app.documentId)) {
            docIdsToAdd.delete(_app.documentId)
          } else {
            return false
          }
        }
        return true
      })
      docIdsToAdd.forEach((docId) => {
        apps.push({ appId, documentId: docId })
      })
      return mergeDeep(cloneDeep(mut), { apps })
    })
  }

  const handleRevertClick = () => {
    setEditingMutation(cloneDeep(originalMutation))
  }

  const handleSaveClick = () => {
    // validate Name
    if (editingMutation.id === `${loggedInAccountId}/mutation/`) {
      setAlert(alerts.noId)
      return
    }

    // validate Name
    const name = editingMutation.metadata.name
    if (name !== name?.trim()) {
      if (!name || name.trim() === '') {
        handleMutationNameChange('')
        return
      }
      editingMutation.metadata.name = name?.trim()
    }

    // validate changes
    const hasChanges = checkIfModified()
    if (!hasChanges) {
      setIsModified(false)
      return
    }

    if (mode === MutationModalMode.Creating || mode === MutationModalMode.Forking) {
      createMutation(editingMutation).then(() => onClose())
    } else if (mode === MutationModalMode.Editing) {
      editMutation(editingMutation).then(() => onClose())
    }
  }

  const handleSaveDropdownChange = (itemId: string) => {
    setMode(itemId as MutationModalMode)
  }

  return (
    <SelectedMutationEditorWrapper>
      <HeaderEditor>
        <HeaderTitle>
          {mode === MutationModalMode.Creating ? 'Create Mutation' : null}
          {mode === MutationModalMode.Editing ? 'Edit Mutation' : null}
          {mode === MutationModalMode.Forking ? 'Fork Mutation' : null}
        </HeaderTitle>
        <Close onClick={onClose}>
          <CloseIcon />
        </Close>
      </HeaderEditor>

      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}
      <InputImage
        ipfsCid={editingMutation.metadata.image?.ipfs_cid ?? undefined}
        onImageChange={handleMutationImageChange}
      />
      <Input
        label="Mutation ID"
        value={editingMutation.id}
        placeholder="dapplets.near/mutation/web"
        onChange={handleMutationIdChange}
        disabled={isFormDisabled || mode === MutationModalMode.Editing}
      />

      <Input
        label="Mutation Name"
        value={editingMutation.metadata.name ?? ''}
        placeholder="My Mutation"
        onChange={handleMutationNameChange}
        disabled={isFormDisabled}
      />

      <AppsList>
        {apps.map((app) =>
          app.permissions.documents ? (
            <ApplicationCardWithDocs
              key={app.id}
              src={app.id}
              metadata={app.metadata}
              docsIds={editingMutation.apps
                .filter((_app) => _app.appId === app.id)
                .map((_app) => _app.documentId)}
              setAppIdToOpenDocsModal={setAppIdToOpenDocsModal}
              onDocCheckboxChange={(docId: string, isChecked: boolean) =>
                handleDocCheckboxChange(docId, app.id, isChecked)
              }
            />
          ) : (
            <SimpleApplicationCard
              key={app.id}
              src={app.id}
              metadata={app.metadata}
              isChecked={editingMutation.apps.some((_app) => _app.appId === app.id)}
              onChange={(val) => handleAppCheckboxChange(app.id, val)}
              disabled={isFormDisabled}
            />
          )
        )}
      </AppsList>

      <ButtonsBlock>
        <Button disabled={isSubmitDisabled} onClick={handleRevertClick}>
          Revert changes
        </Button>
        {!isFormDisabled ? (
          <DropdownButton
            value={mode}
            items={[
              { value: MutationModalMode.Forking, title: 'Fork', visible: !!baseMutation },
              { value: MutationModalMode.Editing, title: 'Save', visible: !!baseMutation && isOwn },
              { value: MutationModalMode.Creating, title: 'Create', visible: !baseMutation },
            ]}
            onClick={handleSaveClick}
            onChange={handleSaveDropdownChange}
            disabled={isSubmitDisabled}
            disabledAll={isFormDisabled}
          />
        ) : (
          <BsButton style={{ width: 175, height: 42, borderRadius: 10 }} variant="primary" disabled>
            <BsSpinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />{' '}
            Sending...
          </BsButton>
        )}
      </ButtonsBlock>

      {appIdToOpenDocsModal ? (
        <>
          <BlurredBackground />
          <DocumentsModal
            appId={appIdToOpenDocsModal}
            onClose={() => setAppIdToOpenDocsModal(null)}
            chosenDocumentsIds={
              editingMutation.apps
                .filter((_app) => _app.appId === appIdToOpenDocsModal && !!_app.documentId)
                .map((_app) => _app.documentId) as string[]
            }
            setDocumentsIds={(val: (string | null)[]) =>
              handleDocCheckboxBanchChange(val, appIdToOpenDocsModal)
            }
          />
        </>
      ) : null}
    </SelectedMutationEditorWrapper>
  )
}
