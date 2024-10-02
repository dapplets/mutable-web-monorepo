import { ApplicationDto, DocumentDto, MutationCreateDto, MutationDto } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { cloneDeep, mergeDeep } from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { ApplicationCardWithDocs, SimpleApplicationCard } from './application-card'
import { Button } from './button'
import { DropdownButton } from './dropdown-button'
import { DocumentsModal } from './documents-modal'
import { ModalConfirm } from './modals-confirm'
import { MutationModalMode } from './types'
import { AppInMutation } from '@mweb/backend'
import { Image } from './image'

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

const ModalConfirmBackground = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: inherit;
`

const Label = styled.div`
  color: #7a818b;
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 700;
`

const CardWrapper = styled.div`
  display: flex;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fff;
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

const createEmptyMutation = (): MutationCreateDto => ({
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
  apps: ApplicationDto[]
  baseMutation: MutationDto | null
  onClose: () => void
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
}

export const MutationEditorModal: FC<Props> = ({ baseMutation, apps, onClose }) => {
  const loggedInAccountId = useAccountId()
  const [isModified, setIsModified] = useState(true)
  const [appIdToOpenDocsModal, setAppIdToOpenDocsModal] = useState<string | null>(null)
  const [docsForModal, setDocsForModal] = useState<DocumentDto[] | null>(null)

  useEscape(onClose)

  const [mode, setMode] = useState(
    !baseMutation
      ? MutationModalMode.Creating
      : baseMutation.authorId === loggedInAccountId
      ? MutationModalMode.Editing
      : MutationModalMode.Forking
  )

  const chooseEditingMutation = (
    changedApps?: AppInMutation[]
  ): MutationCreateDto | MutationDto => {
    const mut =
      mode === MutationModalMode.Forking && baseMutation
        ? {
            metadata: {
              name: '',
              fork_of: baseMutation.id,
            },
            apps: cloneDeep(baseMutation.apps),
            targets: cloneDeep(baseMutation.targets),
          }
        : mode === MutationModalMode.Editing && baseMutation
        ? cloneDeep(baseMutation)
        : createEmptyMutation()
    return changedApps ? mergeDeep(mut, { apps: changedApps }) : mut
  }

  const [editingMutation, setEditingMutation] = useState<MutationCreateDto | MutationDto>(
    chooseEditingMutation()
  )
  const [openConfirm, setOpenConfirm] = useState(false)

  const [alert, setAlert] = useState<IAlert | null>(null)

  useEffect(() => setEditingMutation(chooseEditingMutation(editingMutation.apps)), [mode])

  useEffect(() => {
    const doChecksForAlerts = (): IAlert | null => {
      if (!loggedInAccountId) return alerts.noWallet
      if (!editingMutation?.apps || editingMutation?.apps?.length === 0) return alerts.emptyMutation
      return null
    }
    setIsModified(true)
    setAlert(doChecksForAlerts())
  }, [loggedInAccountId, editingMutation, mode])

  useEffect(() => {
    setAlert((val) => {
      if (!isModified) return alerts.notEditedMutation
      return !val || val?.id === 'notEditedMutation' ? null : val
    })
  }, [isModified])
  const isSubmitDisabled = !isModified || !!alert

  const handleAppCheckboxChange = (appId: string, checked: boolean) => {
    setEditingMutation((mut) => {
      const apps = checked
        ? [...mut.apps, { appId, documentId: null }]
        : mut.apps.filter((app) => app.appId !== appId)
      return mergeDeep(cloneDeep(mut), { apps })
    })
  }

  const handleDocCheckboxChange = (docId: string | null, appId: string, checked: boolean) => {
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
    setEditingMutation(chooseEditingMutation())
  }

  const handleSaveDropdownChange = (itemId: string) => {
    setMode(itemId as MutationModalMode)
  }

  const handleOpenDocumentsModal = (appId: string, docs: DocumentDto[]) => {
    setAppIdToOpenDocsModal(appId)
    setDocsForModal(docs)
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

      {(mode === MutationModalMode.Editing || mode === MutationModalMode.Forking) &&
      baseMutation ? (
        <>
          <Label>Current Mutation</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={baseMutation.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={baseMutation.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{baseMutation.metadata.name}</p>
              <span>
                by{' '}
                {baseMutation.authorId === loggedInAccountId
                  ? `me (${loggedInAccountId})`
                  : baseMutation.authorId}
              </span>
            </TextWrapper>
          </CardWrapper>
        </>
      ) : null}

      <AppsList>
        <Label>Applications List</Label>
        {apps.map((app) =>
          app.permissions.documents ? (
            <ApplicationCardWithDocs
              key={app.id}
              src={app.id}
              metadata={app.metadata}
              disabled={false}
              docsIds={editingMutation.apps
                .filter((_app) => _app.appId === app.id)
                .map((_app) => _app.documentId)}
              onOpenDocumentsModal={(docs: DocumentDto[]) => handleOpenDocumentsModal(app.id, docs)}
              onDocCheckboxChange={(docId: string | null, isChecked: boolean) =>
                handleDocCheckboxChange(docId, app.id, isChecked)
              }
            />
          ) : (
            <SimpleApplicationCard
              key={app.id}
              src={app.id}
              metadata={app.metadata}
              disabled={false}
              isChecked={editingMutation.apps.some((_app) => _app.appId === app.id)}
              onChange={(val) => handleAppCheckboxChange(app.id, val)}
            />
          )
        )}
      </AppsList>

      <ButtonsBlock>
        <Button disabled={isSubmitDisabled} onClick={handleRevertClick}>
          Revert changes
        </Button>
        <DropdownButton
          value={mode}
          items={[
            { value: MutationModalMode.Forking, title: 'Fork', visible: !!baseMutation },
            {
              value: MutationModalMode.Editing,
              title: 'Save',
              visible: !!baseMutation && baseMutation.authorId === loggedInAccountId,
            },
            { value: MutationModalMode.Creating, title: 'Create', visible: !baseMutation },
          ]}
          onClick={() => setOpenConfirm(true)}
          onChange={handleSaveDropdownChange}
          disabled={isSubmitDisabled}
          disabledAll={false}
        />
      </ButtonsBlock>

      {appIdToOpenDocsModal ? (
        <>
          <BlurredBackground />
          <DocumentsModal
            docs={docsForModal}
            onClose={() => setAppIdToOpenDocsModal(null)}
            chosenDocumentsIds={editingMutation.apps
              .filter((_app) => _app.appId === appIdToOpenDocsModal)
              .map((_app) => _app.documentId)}
            setDocumentsIds={(val: (string | null)[]) =>
              handleDocCheckboxBanchChange(val, appIdToOpenDocsModal)
            }
          />
        </>
      ) : null}
      {openConfirm && loggedInAccountId && (
        <ModalConfirmBackground>
          <ModalConfirm
            itemType="mutation"
            mode={mode}
            onCloseCurrent={() => setOpenConfirm(false)}
            onCloseAll={onClose}
            editingMutation={editingMutation}
            baseMutation={baseMutation}
            loggedInAccountId={loggedInAccountId}
          />
        </ModalConfirmBackground>
      )}
    </SelectedMutationEditorWrapper>
  )
}
