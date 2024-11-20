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
  DropdownContainer,
  DropdownItem,
  SpanStyled,
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

import { useDeleteLocalMutation, useMutableWeb, useMutationVersions } from '@mweb/engine'
import { EntitySourceType, MutationWithSettings } from '@mweb/backend'
import defaultIcon from '../assets/images/default.svg'
import { Image } from './image'
import { Badge } from './badge'
import { ArrowDownOutlined, DeleteOutlined, EyeFilled, EyeInvisibleFilled } from '@ant-design/icons'
import styled from 'styled-components'
import { ModalDelete } from './modal-delete'

const LatestKey = 'latest'

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
    getPreferredSource,
    removeMutationFromRecents,
  } = useMutableWeb()

  const { deleteLocalMutation } = useDeleteLocalMutation()
  const { mutationVersions, areMutationVersionsLoading } = useMutationVersions(
    selectedMutation?.id ?? null
  )
  const { switchMutationVersion, mutationVersions: currentMutationVersions } = useMutableWeb()
  const [expanded, setExpanded] = useState(false)

  const toggleDropdown = () => setExpanded(!expanded)
  const handleChange = (key: string) => {
    if (selectedMutation?.id) {
      switchMutationVersion(selectedMutation?.id, key === LatestKey ? null : key?.toString())
    }
  }

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

    switchPreferredSource(selectedMutation.id, source)
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
      {selectedMutation && selectedMutation.metadata && mutationVersions.length > 0
        ? mutationVersions.map((version) => (
            <>
              <SpanStyled>
                v{selectedMutation.version}{' '}
                {expanded ? (
                  <OpenList onClick={toggleDropdown}>
                    <IconDropdown />
                  </OpenList>
                ) : (
                  <OpenListDefault onClick={toggleDropdown}>
                    <IconDropdown />
                  </OpenListDefault>
                )}
              </SpanStyled>
              {expanded && (
                <DropdownContainer expanded={expanded}>
                  <DropdownItem onClick={() => handleChange(version.version)} key={version.version}>
                    v{version.version}
                  </DropdownItem>{' '}
                </DropdownContainer>
              )}
            </>
          ))
        : selectedMutation &&
          selectedMutation.metadata && <SpanStyled>v{selectedMutation.version}</SpanStyled>}

      <SelectedMutationBlock
        onClick={() => onVisibilityChange(!isVisible)}
        data-testid="selected-mutation-block"
      >
        <SelectedMutationInfo>
          {selectedMutation && selectedMutation.metadata ? (
            <>
              <SelectedMutationDescription>
                {recentlyUsedMutations[selectedMutation.id]?.length === 2 ? (
                  <Badge
                    margin="0 4px 0 0"
                    icon={
                      selectedMutation.source === EntitySourceType.Local ? (
                        <EyeFilled />
                      ) : (
                        <EyeInvisibleFilled />
                      )
                    }
                    size="small"
                    text={selectedMutation.source}
                    theme={selectedMutation.source === EntitySourceType.Local ? 'white' : 'blue'}
                    onClick={handleSwitchSourceClick}
                  />
                ) : selectedMutation.source === EntitySourceType.Local ? (
                  <Badge margin="0 4px 0 0" text={selectedMutation.source} theme="white" />
                ) : null}

                {selectedMutation.metadata.name}
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
                {Object.values(recentlyUsedMutations).map((muts) => {
                  if (!muts || !muts.length) return null
                  const recentlyUsedSource = getPreferredSource(muts[0].id)
                  const mut =
                    muts.find(
                      (mut) => mut.source === (recentlyUsedSource ?? EntitySourceType.Local)
                    ) ?? muts[0]
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
                          {recentlyUsedMutations[mut.id]?.length === 2 ? (
                            mut.source === EntitySourceType.Local ? (
                              <Badge margin="0 0 0 4px" text="local on" theme="blue" />
                            ) : (
                              <Badge margin="0 0 0 4px" text="local off" theme="yellow" />
                            )
                          ) : mut.source === EntitySourceType.Local ? (
                            <Badge margin="0 0 0 4px" text="local" theme="blue" />
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
                      ) : mut.id !== selectedMutation?.id &&
                        mut.id !== favoriteMutationId &&
                        !getPreferredSource(mut.id) ? (
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
              <AvalibleMutations>
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
