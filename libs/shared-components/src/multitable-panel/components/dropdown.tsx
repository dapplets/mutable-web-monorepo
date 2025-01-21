import { EntitySourceType } from '@mweb/backend'
import {
  useDeleteLocalMutation,
  useFavoriteMutation,
  useMutations,
  useRemoveMutationFromRecents,
  useSetFavoriteMutation,
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
  WrapperDropdown,
} from '../assets/styles-dropdown'
import { AvailableIcon, Back, Mutate } from '../assets/vectors'
import { Image } from './image'
import { ModalDelete } from './modal-delete'
import { MutationDropdownItem } from './mutation-dropdown-item'

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

export type DropdownProps = {
  onMutateButtonClick: () => void
}

export const Dropdown: FC<DropdownProps> = ({ onMutateButtonClick }: DropdownProps) => {
  const { tree, selectedMutationId, onSwitchMutation } = useEngine()
  const { mutations } = useMutations(tree)
  const { favoriteMutationId } = useFavoriteMutation()
  const { setFavoriteMutation } = useSetFavoriteMutation()

  const { deleteLocalMutation } = useDeleteLocalMutation()
  const { removeMutationFromRecents } = useRemoveMutationFromRecents()

  const recentlyUsedMutations = useMemo(
    () =>
      Object.groupBy(
        mutations
          .filter((mut) => mut.settings.lastUsage)
          .sort((a, b) => {
            const dateA = a.settings.lastUsage ? new Date(a.settings.lastUsage).getTime() : null
            const dateB = b.settings.lastUsage ? new Date(b.settings.lastUsage).getTime() : null

            if (!dateA) return 1
            if (!dateB) return -1

            return dateB - dateB
          }),
        (mut) => mut.id
      ),
    [mutations]
  )

  const [isAccordeonExpanded, setIsAccordeonExpanded] = useState(
    Object.keys(recentlyUsedMutations).length === 0
  )
  const [mutationIdToDelete, setMutationIdToDelete] = useState<string | null>(null)

  const unusedMutations = useMemo(
    () =>
      Object.groupBy(
        mutations.filter((mut) => !mut.settings.lastUsage),
        (mut) => mut.id
      ),
    [mutations]
  )

  const handleMutationClick = (mutationId: string) => {
    onSwitchMutation(mutationId)
  }

  // todo: mock
  const handleAccordeonClick = () => {
    setIsAccordeonExpanded((val) => !val)
  }

  const handleMutateButtonClick = () => {
    onMutateButtonClick()
  }

  const handleFavoriteButtonClick = (mutationId: string) => {
    setFavoriteMutation(mutationId === favoriteMutationId ? null : mutationId)
  }

  const handleOriginalButtonClick = () => {
    onSwitchMutation(null)
  }

  const handleRemoveFromRecentlyUsedClick = (mutationId: string) => {
    removeMutationFromRecents(mutationId)
  }

  return (
    <WrapperDropdown>
      <MutationsList>
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
                  local={muts?.find((mut) => mut.source === EntitySourceType.Local)}
                  origin={muts?.find((mut) => mut.source === EntitySourceType.Origin)}
                  isSelected={mutationId === selectedMutationId}
                  isFavorite={mutationId === favoriteMutationId}
                  onFavoriteClick={() => handleFavoriteButtonClick(mutationId)}
                  onDeleteClick={() => setMutationIdToDelete(mutationId)}
                  onRemoveFromRecentClick={() => handleRemoveFromRecentlyUsedClick(mutationId)}
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
              onAction={async () => {
                await deleteLocalMutation(mutationIdToDelete)
                if (mutationIdToDelete === favoriteMutationId)
                  handleFavoriteButtonClick(mutationIdToDelete)
                setMutationIdToDelete(null)
              }}
              onCloseCurrent={() => setMutationIdToDelete(null)}
            />
          </ModalConfirmBackground>
        )}
      </MutationsList>
    </WrapperDropdown>
  )
}
