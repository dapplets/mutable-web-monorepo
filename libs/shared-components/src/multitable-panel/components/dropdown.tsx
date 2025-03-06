import { EntitySourceType } from '@mweb/backend'
import {
  useDeleteLocalMutation,
  useFavoriteMutation,
  useMutations,
  useRemoveMutationFromRecents,
  useSetFavoriteMutation,
  useMutationsLastUsage,
  useUpdateMutationLastUsage,
  useSetPreferredSource,
  useGetSelectedMutation,
  useSetSelectedMutation,
} from '@mweb/react-engine'
import React, { FC, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useEngine } from '../../contexts/engine-context'
import {
  AuthorMutation,
  AvalibleArrowBlock,
  AvalibleArrowLable,
  AvalibleLable,
  AvalibleLableBlock,
  AvalibleMutations,
  ButtonBack,
  ButtonListBlock,
  ButtonMutation,
  ImageBlock,
  InputBlock,
  InputInfoWrapper,
  InputMutation,
  ListMutations,
  MutationsList,
  MutationsListWrapper,
  ScrollContent,
} from '../assets/styles-dropdown'
import { AvailableIcon, Back, Mutate } from '../assets/vectors'
import { Image } from '../../common/image'
import { ModalDelete } from './modal-delete'
import { MutationDropdownItem } from './mutation-dropdown-item'
import { useNavigate } from 'react-router'

const ModalConfirmBackground = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 190px;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: inherit;
  z-index: 1;
`

export type DropdownProps = {}

export const Dropdown: FC<DropdownProps> = ({}: DropdownProps) => {
  const navigate = useNavigate()
  const { tree } = useEngine()
  const { mutations } = useMutations(tree)
  const { selectedMutationId } = useGetSelectedMutation(tree?.id)
  const { favoriteMutationId } = useFavoriteMutation(tree?.id)
  const { setFavoriteMutation } = useSetFavoriteMutation()

  const { deleteLocalMutation } = useDeleteLocalMutation()
  const { removeMutationFromRecents } = useRemoveMutationFromRecents()
  const { updateMutationLastUsage } = useUpdateMutationLastUsage()
  const { setPreferredSource } = useSetPreferredSource()
  const { setSelectedMutationId } = useSetSelectedMutation()

  const mutationsById = useMemo(() => Object.groupBy(mutations, (mut) => mut.id), [mutations])
  const mutationIds = useMemo(() => Object.keys(mutationsById), [mutationsById])
  const lastUsages = useMutationsLastUsage(mutationIds, tree)

  const recentlyUsedMutations = useMemo(
    () =>
      Object.fromEntries(
        mutationIds
          .map((_, index) => index)
          .filter((index) => lastUsages[index].data)
          // Sort by last use is disabled because the list is re-sorted when you click on it.
          // .sort((a, b) => (lastUsages[a].data! > lastUsages[b].data! ? 1 : -1))
          .map((index) => [mutationIds[index], mutationsById[mutationIds[index]]!])
      ),
    [mutationsById, mutationIds, lastUsages]
  )

  const [isAccordeonExpanded, setIsAccordeonExpanded] = useState(
    Object.keys(recentlyUsedMutations).length === 0
  )
  const [mutationIdToDelete, setMutationIdToDelete] = useState<string | null>(null)

  const unusedMutations = useMemo(
    () =>
      Object.fromEntries(
        mutationIds
          .map((_, index) => index)
          .filter((index) => !lastUsages[index].data)
          .map((index) => [mutationIds[index], mutationsById[mutationIds[index]]!])
      ),
    [mutationsById, mutationIds, lastUsages]
  )

  const handleMutationClick = (mutationId: string) => {
    if (!tree?.id) return
    setSelectedMutationId(tree.id, mutationId)
    updateMutationLastUsage({ mutationId, context: tree })
  }

  // todo: mock
  const handleAccordeonClick = () => {
    setIsAccordeonExpanded((val) => !val)
  }

  const handleMutateButtonClick = () => {
    navigate(`/edit-mutation/${selectedMutationId}`)
  }

  const handleFavoriteButtonClick = (mutationId: string) => {
    const contextId = tree?.id
    if (!contextId) throw new Error('No root context ID found')
    setFavoriteMutation(contextId, mutationId === favoriteMutationId ? null : mutationId)
  }

  const handleOriginalButtonClick = () => {
    if (!tree?.id) throw new Error('No root context ID found')
    setSelectedMutationId(tree.id, null)
  }

  const handleRemoveFromRecentlyUsedClick = (mutationId: string) => {
    if (!tree) return null
    removeMutationFromRecents({ mutationId, context: tree })
  }

  const handleConfirmDeleteClick = async () => {
    if (!mutationIdToDelete) return

    if (mutationIdToDelete === favoriteMutationId) {
      handleFavoriteButtonClick(mutationIdToDelete)
    }

    if (tree?.id) {
      setPreferredSource(mutationIdToDelete, tree.id, EntitySourceType.Origin)
    }

    deleteLocalMutation(mutationIdToDelete)

    setMutationIdToDelete(null)
  }

  return (
    <MutationsList>
      <ScrollContent>
        <ButtonListBlock>
          <ButtonBack onClick={handleOriginalButtonClick}>{<Back />} to Original</ButtonBack>
          <ButtonMutation
            onClick={handleMutateButtonClick}
            data-testid="mutate-button"
            data-mweb-context-type="notch"
            data-mweb-context-parsed={JSON.stringify({ id: 'mutate-button' })}
            data-mweb-context-level="system"
          >
            Mutate {<Mutate />}
            <div data-mweb-insertion-point="hidden" style={{ display: 'none' }}></div>
          </ButtonMutation>
        </ButtonListBlock>
        <MutationsListWrapper>
          {Object.keys(recentlyUsedMutations).length > 0 ? (
            <ListMutations
              data-testid="recently-used-mutations"
              data-mweb-context-type="notch"
              data-mweb-context-parsed={JSON.stringify({ id: 'recently-used-mutations' })}
              data-mweb-context-level="system"
            >
              {Object.entries(recentlyUsedMutations).map(([mutationId, muts]) => (
                <MutationDropdownItem
                  key={mutationId}
                  local={muts.find((mut) => mut.source === EntitySourceType.Local)}
                  origin={muts.find((mut) => mut.source === EntitySourceType.Origin)}
                  isSelected={mutationId === selectedMutationId}
                  isFavorite={mutationId === favoriteMutationId}
                  onFavoriteClick={() => handleFavoriteButtonClick(mutationId)}
                  onDeleteClick={() => setMutationIdToDelete(mutationId)}
                  onRemoveFromRecentClick={() => handleRemoveFromRecentlyUsedClick(mutationId)}
                  onSelect={() => handleMutationClick(mutationId)}
                />
              ))}
              <div
                data-mweb-insertion-point="recently-used-mutations"
                style={{ display: 'none' }}
              ></div>
            </ListMutations>
          ) : null}

          {Object.keys(unusedMutations).length > 0 ? (
            <AvalibleMutations>
              <AvalibleLableBlock
                onClick={handleAccordeonClick}
                data-testid="unused-mutations-title"
                data-mweb-context-type="notch"
                data-mweb-context-parsed={JSON.stringify({ id: 'unused-mutations-title' })}
                data-mweb-context-level="system"
              >
                <AvalibleLable>available</AvalibleLable>
                {/* todo: mock */}
                <AvalibleArrowBlock className={isAccordeonExpanded ? 'iconRotate' : ''}>
                  <AvalibleArrowLable>
                    {Object.keys(unusedMutations).length} mutations
                  </AvalibleArrowLable>
                  <AvailableIcon />
                </AvalibleArrowBlock>
                <div data-mweb-insertion-point="hidden" style={{ display: 'none' }}></div>
              </AvalibleLableBlock>

              {isAccordeonExpanded ? (
                <div data-testid="unused-mutations">
                  {Object.values(unusedMutations).map((muts) => {
                    if (!muts) return null
                    const [mut] = muts

                    return (
                      <InputBlock
                        key={mut.id}
                        data-testid={mut.id}
                        isActive={mut.id === selectedMutationId}
                        onClick={() => handleMutationClick(mut.id)}
                        className="avalibleMutationsInput"
                      >
                        <ImageBlock>
                          <Image
                            image={mut.metadata.image}
                            // fallbackUrl={defaultIcon}
                          />
                        </ImageBlock>
                        <InputInfoWrapper>
                          <InputMutation>{mut.metadata ? mut.metadata.name : ''}</InputMutation>
                          {mut.authorId ? <AuthorMutation>by {mut.authorId}</AuthorMutation> : null}
                        </InputInfoWrapper>
                      </InputBlock>
                    )
                  })}
                </div>
              ) : null}
            </AvalibleMutations>
          ) : null}
        </MutationsListWrapper>

        {mutationIdToDelete && (
          <ModalConfirmBackground>
            <ModalDelete
              onAction={handleConfirmDeleteClick}
              onCloseCurrent={() => setMutationIdToDelete(null)}
            />
          </ModalConfirmBackground>
        )}
      </ScrollContent>
    </MutationsList>
  )
}
