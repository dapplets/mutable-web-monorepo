import { ApplicationDto, DocumentDto, EntitySourceType, MutationDto } from '@mweb/backend'
import { useAccountId } from 'near-social-vm'
import React, { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { cloneDeep, mergeDeep } from '../../helpers'
import { useEscape } from '../../hooks/use-escape'
import { Alert, AlertProps } from './alert'
import { ApplicationCardWithDocs, SimpleApplicationCard } from './application-card'
import { Button } from './button'
import { DocumentsModal } from './documents-modal'
import { ModalConfirm } from './modals-confirm'
import { Image } from './image'
import { useSaveMutation } from '@mweb/react-engine'
import { ButtonsGroup } from './buttons-group'
import { useMutableWeb } from '@mweb/engine'
import { MutationVersionDropdown } from './mutation-version-dropdown'

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

const EMPTY_MUTATION_ID = '/mutation/NewMutation'

const createEmptyMutation = (): MutationDto => ({
  authorId: null,
  blockNumber: 0,
  version: '0',
  id: EMPTY_MUTATION_ID,
  localId: 'NewMutation',
  timestamp: 0,
  source: EntitySourceType.Local, // ToDo: actually source will be changed in click handlers
  apps: [],
  metadata: {
    name: 'New Mutation',
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
  localMutations: MutationDto[]
  onClose: () => void
}

interface IAlert extends AlertProps {
  id: string
}

const alerts: { [name: string]: IAlert } = {
  noWallet: {
    id: 'noWallet',
    text: 'Connect the NEAR wallet to publish the mutation.',
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

export const MutationEditorModal: FC<Props> = ({ apps, baseMutation, localMutations, onClose }) => {
  const { switchMutation, switchPreferredSource, isLoading } = useMutableWeb()
  const loggedInAccountId = useAccountId()
  const [isModified, setIsModified] = useState(true)
  const [appIdToOpenDocsModal, setAppIdToOpenDocsModal] = useState<string | null>(null)
  const [docsForModal, setDocsForModal] = useState<DocumentDto[] | null>(null)
  const [expandedVersion, setExpandedVersion] = useState(false)
  const toggleDropdown = () => setExpandedVersion(!expandedVersion)
  const { saveMutation, isLoading: isSaving } = useSaveMutation()

  useEscape(onClose)

  // Call `setEditingMutation(chooseEditingMutation())` if you want to revert changes
  const chooseEditingMutation = (): MutationDto =>
    baseMutation
      ? baseMutation.source === EntitySourceType.Local
        ? baseMutation
        : localMutations.find((m) => m.id === baseMutation.id) ?? cloneDeep(baseMutation)
      : localMutations.find((m) => m.id === EMPTY_MUTATION_ID) ?? createEmptyMutation()

  const [editingMutation, setEditingMutation] = useState<MutationDto>(chooseEditingMutation())
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [alert, setAlert] = useState<IAlert | null>(null)

  // Reload the base mutation if it changed (e.g. if a mutation version was updated)
  useEffect(() => {
    setEditingMutation(chooseEditingMutation())
  }, [isLoading])

  useEffect(() => {
    const doChecksForAlerts = (): IAlert | null => {
      if (!loggedInAccountId) return alerts.noWallet
      if (!editingMutation?.apps || editingMutation?.apps?.length === 0) return alerts.emptyMutation
      return null
    }
    setIsModified(true)
    setAlert(doChecksForAlerts())
  }, [loggedInAccountId, editingMutation])

  useEffect(() => {
    setAlert((val) => {
      if (!isModified) return alerts.notEditedMutation
      return !val || val?.id === 'notEditedMutation' ? null : val
    })
  }, [isModified])

  const isLocalSubmitDisabled = !isModified || (alert && alert.id !== 'noWallet') || isSaving
  const isRemoteSubmitDisabled = !isModified || !!alert

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

  const handleSaveLocallyClick = () => {
    const localMutation = mergeDeep(cloneDeep(editingMutation), { source: EntitySourceType.Local })

    saveMutation(localMutation)
      .then(({ id }) => {
        switchMutation(id)
        switchPreferredSource(id, EntitySourceType.Local)
      })
      .then(onClose)
  }

  const handlePublishClick = () => {
    setIsConfirmModalOpen(true)
  }

  const handleOpenDocumentsModal = (appId: string, docs: DocumentDto[]) => {
    setAppIdToOpenDocsModal(appId)
    setDocsForModal(docs)
  }

  return (
    <SelectedMutationEditorWrapper>
      <HeaderEditor>
        <HeaderTitle>Edit Mutation</HeaderTitle>
        <Close onClick={onClose}>
          <CloseIcon />
        </Close>
      </HeaderEditor>

      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}

      {baseMutation ? (
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
              <p>{baseMutation.metadata.name} </p>
              <span>
                by{' '}
                {!baseMutation.authorId && !loggedInAccountId
                  ? 'me'
                  : (!baseMutation.authorId && loggedInAccountId) ||
                    baseMutation.authorId === loggedInAccountId
                  ? `me (${loggedInAccountId})`
                  : baseMutation.authorId}
                <MutationVersionDropdown
                  toggleDropdown={toggleDropdown}
                  expanded={expandedVersion}
                  isWhite
                  mutationId={baseMutation?.id ?? null}
                />
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
              source={app.source}
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
              source={app.source}
              metadata={app.metadata}
              disabled={false}
              isChecked={editingMutation.apps.some((_app) => _app.appId === app.id)}
              onChange={(val) => handleAppCheckboxChange(app.id, val)}
            />
          )
        )}
      </AppsList>

      <ButtonsGroup>
        <Button disabled={isLocalSubmitDisabled} onClick={handleSaveLocallyClick}>
          Save Locally
        </Button>
        <Button disabled={isRemoteSubmitDisabled} onClick={handlePublishClick} primary>
          Publish
        </Button>
      </ButtonsGroup>

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

      {isConfirmModalOpen && loggedInAccountId && (
        <ModalConfirmBackground>
          <ModalConfirm
            itemType="mutation"
            onCloseCurrent={() => setIsConfirmModalOpen(false)}
            onCloseAll={onClose}
            editingMutation={editingMutation}
            loggedInAccountId={loggedInAccountId}
          />
        </ModalConfirmBackground>
      )}
    </SelectedMutationEditorWrapper>
  )
}
