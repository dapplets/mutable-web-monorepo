import React, { DetailedHTMLProps, FC, HTMLAttributes, useMemo, useState } from 'react'
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
  InputIconWrapper,
  InputInfoWrapper,
  InputMutation,
  ListMutations,
  MutationsList,
  MutationsListWrapper,
  OpenList,
  OpenListDefault,
  SelectedMutationBlock,
  SelectedMutationDescription,
  SelectedMutationId,
  SelectedMutationInfo,
  StarSelectedMutationWrapper,
  WrapperDropdown,
} from '../assets/styles-dropdown'
import {
  AvailableIcon,
  Back,
  IconDropdown,
  Mutate,
  StarMutationList,
  StarMutationListDefault,
  StarSelectMutation,
  StarSelectMutationDefault,
} from '../assets/vectors'

import { useDeleteLocalMutation, useMutableWeb } from '@mweb/engine'
import { EntitySourceType, MutationWithSettings } from '@mweb/backend'
import defaultIcon from '../assets/images/default.svg'
import { Image } from './image'
import { Badge } from './badge'
import { ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { ModalDelete } from './modal-delete'

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
  z-index: 1;
`

export type DropdownProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  isVisible: boolean
  onVisibilityChange: (visible: boolean) => void
  onMutateButtonClick: () => void
}

export const Dropdown: FC<DropdownProps> = ({
  isVisible,
  onVisibilityChange,
  onMutateButtonClick,
}: DropdownProps) => {
  const {
    mutations,
    selectedMutation,
    favoriteMutationId,
    setFavoriteMutation,
    switchMutation,
    switchPreferredSource,
    removeMutationFromRecents,
  } = useMutableWeb()

  const { deleteLocalMutation } = useDeleteLocalMutation()

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
    onVisibilityChange(false)
    switchMutation(mutationId)
  }

  const handleSwitchSourceClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation() // do not open dropdown

    if (!selectedMutation) return

    const source =
      selectedMutation.source === EntitySourceType.Local
        ? EntitySourceType.Origin
        : EntitySourceType.Local

    switchPreferredSource(source)
  }

  // todo: mock
  const handleAccordeonClick = () => {
    setIsAccordeonExpanded((val) => !val)
  }

  const handleMutateButtonClick = () => {
    onVisibilityChange(false)
    onMutateButtonClick()
  }

  const handleFavoriteButtonClick = (mutationId: string) => {
    setFavoriteMutation(mutationId === favoriteMutationId ? null : mutationId)
  }

  const handleOriginalButtonClick = async () => {
    onVisibilityChange(false)
    switchMutation(null)
  }

  const handleRemoveFromRecentlyUsedClick = async (mut: MutationWithSettings) => {
    removeMutationFromRecents(mut.id)
  }

  return (
    <WrapperDropdown>
      <SelectedMutationBlock
        onClick={() => onVisibilityChange(!isVisible)}
        data-testid="selected-mutation-block"
      >
        <SelectedMutationInfo>
          {selectedMutation && selectedMutation.metadata ? (
            <>
              <SelectedMutationDescription>
                {selectedMutation.metadata.name}
                {recentlyUsedMutations[selectedMutation.id]?.length === 2 ? (
                  <Badge
                    margin="0 0 0 4px"
                    text={'eye ' + selectedMutation.source}
                    theme={'white'}
                    onClick={handleSwitchSourceClick}
                  />
                ) : selectedMutation.source === EntitySourceType.Local ? (
                  <Badge margin="0 0 0 4px" text={selectedMutation.source} theme={'white'} />
                ) : null}
              </SelectedMutationDescription>
              {selectedMutation.authorId ? (
                <SelectedMutationId>by {selectedMutation.authorId}</SelectedMutationId>
              ) : null}
            </>
          ) : (
            <SelectedMutationDescription>No mutations applied</SelectedMutationDescription>
          )}
        </SelectedMutationInfo>

        {selectedMutation ? (
          <StarSelectedMutationWrapper
            onClick={() => handleFavoriteButtonClick(selectedMutation.id)}
          >
            {selectedMutation.id === favoriteMutationId ? (
              <StarSelectMutation />
            ) : (
              <StarSelectMutationDefault />
            )}
          </StarSelectedMutationWrapper>
        ) : null}

        {isVisible ? (
          <OpenList onClick={() => onVisibilityChange(!isVisible)}>
            <IconDropdown />
          </OpenList>
        ) : (
          <OpenListDefault onClick={() => onVisibilityChange(!isVisible)}>
            <IconDropdown />
          </OpenListDefault>
        )}
      </SelectedMutationBlock>

      {isVisible && (
        <MutationsList>
          <MutationsListWrapper>
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

            {Object.keys(recentlyUsedMutations).length > 0 ? (
              <ListMutations
                isAccordeonExpanded={isAccordeonExpanded}
                data-testid="recently-used-mutations"
                data-mweb-context-type="notch"
                data-mweb-context-parsed={JSON.stringify({ id: 'recently-used-mutations' })}
                data-mweb-context-level="system"
              >
                {Object.values(recentlyUsedMutations).map((muts) => {
                  if (!muts) return null
                  const [localMut, remoteMut] = muts.sort((a) =>
                    a.source === EntitySourceType.Local ? -1 : 1
                  )
                  const mut = localMut ?? remoteMut

                  return (
                    <InputBlock key={mut.id} isActive={mut.id === selectedMutation?.id}>
                      <ImageBlock>
                        <Image image={mut.metadata.image} fallbackUrl={defaultIcon} />
                      </ImageBlock>
                      <InputInfoWrapper onClick={() => handleMutationClick(mut.id)}>
                        {/* todo: mocked classname */}
                        <InputMutation
                          className={mut.id === selectedMutation?.id ? 'inputMutationSelected' : ''}
                        >
                          {mut.metadata ? mut.metadata.name : ''}{' '}
                          {mut.source === EntitySourceType.Local ? (
                            <Badge margin="0 0 0 4px" text={mut.source} theme={'blue'} />
                          ) : null}
                        </InputMutation>
                        {/* todo: mocked classname */}
                        {mut.authorId ? (
                          <AuthorMutation
                            className={
                              mut.id === selectedMutation?.id && mut.id === favoriteMutationId
                                ? 'authorMutationSelected'
                                : ''
                            }
                          >
                            by {mut.authorId}
                          </AuthorMutation>
                        ) : null}
                      </InputInfoWrapper>
                      {/* todo: mocked */}

                      {mut.id === favoriteMutationId ? (
                        <InputIconWrapper onClick={() => handleFavoriteButtonClick(mut.id)}>
                          <StarMutationList />
                        </InputIconWrapper>
                      ) : mut.id === selectedMutation?.id ? (
                        <InputIconWrapper onClick={() => handleFavoriteButtonClick(mut.id)}>
                          <StarMutationListDefault />
                        </InputIconWrapper>
                      ) : null}

                      {mut.source === EntitySourceType.Local ? (
                        <InputIconWrapper onClick={() => setMutationIdToDelete(mut.id)}>
                          <DeleteOutlined />
                        </InputIconWrapper>
                      ) : mut.id !== selectedMutation?.id ? (
                        <InputIconWrapper onClick={() => handleRemoveFromRecentlyUsedClick(mut)}>
                          <ArrowDownOutlined />
                        </InputIconWrapper>
                      ) : null}
                    </InputBlock>
                  )
                })}
                <div
                  data-mweb-insertion-point="recently-used-mutations"
                  style={{ display: 'none' }}
                ></div>
              </ListMutations>
            ) : null}

            {Object.keys(unusedMutations).length > 0 ? (
              <AvalibleMutations isAccordeonExpanded={isAccordeonExpanded}>
                <AvalibleLableBlock
                  onClick={handleAccordeonClick}
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
                          isActive={mut.id === selectedMutation?.id}
                          onClick={() => handleMutationClick(mut.id)}
                          className="avalibleMutationsInput"
                        >
                          <ImageBlock>
                            <Image image={mut.metadata.image} fallbackUrl={defaultIcon} />
                          </ImageBlock>
                          <InputInfoWrapper>
                            <InputMutation>{mut.metadata ? mut.metadata.name : ''}</InputMutation>
                            {mut.authorId ? (
                              <AuthorMutation>by {mut.authorId}</AuthorMutation>
                            ) : null}
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
      )}
    </WrapperDropdown>
  )
}
