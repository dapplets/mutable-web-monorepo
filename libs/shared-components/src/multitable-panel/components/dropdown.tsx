import { ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons'
import { EntitySourceType, MutationWithSettings } from '@mweb/backend'
import { useDeleteLocalMutation, useMutableWeb } from '@mweb/engine'
import React, { DetailedHTMLProps, FC, HTMLAttributes, useMemo, useState } from 'react'
import styled from 'styled-components'
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
  WrapperDropdown,
} from '../assets/styles-dropdown'
import {
  AvailableIcon,
  Back,
  Mutate,
  StarMutationList,
  StarMutationListDefault,
} from '../assets/vectors'
import { Badge } from './badge'
import { Image } from './image'
import { ModalDelete } from './modal-delete'

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
  onMutateButtonClick: () => void
}

export const Dropdown: FC<DropdownProps> = ({ onMutateButtonClick }: DropdownProps) => {
  const {
    mutations,
    selectedMutation,
    favoriteMutationId,
    setFavoriteMutation,
    switchMutation,
    getPreferredSource,
    removeMutationFromRecents,
  } = useMutableWeb()

  const { deleteLocalMutation } = useDeleteLocalMutation()

  const recentlyUsedMutations = useMemo(() => {
    if (!selectedMutation) return []

    let recentList = Object.values(mutations).flat()

    recentList = recentList.filter((mut) => mut.id !== selectedMutation.id)

    recentList.unshift(selectedMutation)

    recentList.sort((a, b) => {
      if (a.id === selectedMutation.id) return -1
      if (b.id === selectedMutation.id) return 1

      if (a.source === EntitySourceType.Local && b.source !== EntitySourceType.Local) return -1
      if (b.source === EntitySourceType.Local && a.source !== EntitySourceType.Local) return 1
      return 0
    })

    const localMutations = recentList.filter((mut) => mut.source === EntitySourceType.Local)
    const otherMutations = recentList.filter((mut) => mut.source !== EntitySourceType.Local)

    const limitedOtherMutations = otherMutations.slice(0, 5 - localMutations.length)

    return [...localMutations, ...limitedOtherMutations]
  }, [selectedMutation, mutations])

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
    switchMutation(mutationId)
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

  const handleOriginalButtonClick = async () => {
    switchMutation(null)
  }

  const handleRemoveFromRecentlyUsedClick = async (mut: MutationWithSettings) => {
    removeMutationFromRecents(mut.id)
  }

  const getBadgeProps = (mut: { source: EntitySourceType; id: string | undefined }) => {
    if (mut.source === EntitySourceType.Local) {
      return {
        text: mut.id === selectedMutation?.id ? 'local on' : 'local',
        theme: 'blue',
      }
    } else if (mut.id === selectedMutation?.id) {
      return {
        text: 'local off',
        theme: 'yellow',
      }
    }
    return null
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
          {recentlyUsedMutations.length > 0 ? (
            <ListMutations
              data-testid="recently-used-mutations"
              data-mweb-context-type="notch"
              data-mweb-context-parsed={JSON.stringify({ id: 'recently-used-mutations' })}
              data-mweb-context-level="system"
            >
              {recentlyUsedMutations.map((muts) => {
                if (!muts) return null
                return (
                  <InputBlock
                    data-testid={muts.id}
                    className={muts.id === selectedMutation?.id ? 'active-mutation' : ''}
                    key={muts.id}
                    isActive={muts.id === selectedMutation?.id}
                  >
                    <ImageBlock>
                      <Image
                        image={muts.metadata.image}
                        // fallbackUrl={defaultIcon}
                      />
                    </ImageBlock>
                    <InputInfoWrapper onClick={() => handleMutationClick(muts.id)}>
                      {/* todo: mocked classname */}
                      <InputMutation
                        className={muts.id === selectedMutation?.id ? 'inputMutationSelected' : ''}
                      >
                        {muts.metadata ? muts.metadata.name : ''}{' '}
                        {(() => {
                          const badgeProps = getBadgeProps(muts)
                          return badgeProps ? (
                            <Badge
                              margin="0 0 0 4px"
                              text={badgeProps.text}
                              theme={badgeProps.theme as any}
                            />
                          ) : null
                        })()}
                      </InputMutation>
                      {/* todo: mocked classname */}
                      {muts.authorId ? (
                        <AuthorMutation
                          className={
                            muts.id === selectedMutation?.id && muts.id === favoriteMutationId
                              ? 'authorMutationSelected'
                              : ''
                          }
                        >
                          by {muts.authorId}
                        </AuthorMutation>
                      ) : null}
                    </InputInfoWrapper>
                    {/* todo: mocked */}

                    {muts.id === favoriteMutationId ? (
                      <InputIconWrapper onClick={() => handleFavoriteButtonClick(muts.id)}>
                        <StarMutationList />
                      </InputIconWrapper>
                    ) : muts.id === selectedMutation?.id ? (
                      <InputIconWrapper onClick={() => handleFavoriteButtonClick(muts.id)}>
                        <StarMutationListDefault />
                      </InputIconWrapper>
                    ) : null}

                    {muts.source === EntitySourceType.Local ? (
                      <InputIconWrapper onClick={() => setMutationIdToDelete(muts.id)}>
                        <DeleteOutlined />
                      </InputIconWrapper>
                    ) : muts.id !== selectedMutation?.id &&
                      muts.id !== favoriteMutationId &&
                      !getPreferredSource(muts.id) ? (
                      <InputIconWrapper onClick={() => handleRemoveFromRecentlyUsedClick(muts)}>
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
                        isActive={mut.id === selectedMutation?.id}
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
