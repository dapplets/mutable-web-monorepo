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
import { MutationVersionDropdown } from './mutation-version-dropdown'

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
  const [expandedVersion, setExpandedVersion] = useState(false)
  const toggleDropdown = () => setExpandedVersion(!expandedVersion)

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
              {Object.values(recentlyUsedMutations).map((muts) => {
                if (!muts || !muts.length) return null
                const recentlyUsedSource = getPreferredSource(muts[0].id)
                const mut =
                  muts.find(
                    (mut) => mut.source === (recentlyUsedSource ?? EntitySourceType.Local)
                  ) ?? muts[0]
                return (
                  <InputBlock
                    data-testid={mut.id}
                    className={mut.id === selectedMutation?.id ? 'active-mutation' : ''}
                    key={mut.id}
                    isActive={mut.id === selectedMutation?.id}
                  >
                    <ImageBlock>
                      <Image
                        image={mut.metadata.image}
                        // fallbackUrl={defaultIcon}
                      />
                    </ImageBlock>
                    <InputInfoWrapper onClick={() => handleMutationClick(mut.id)}>
                      {/* todo: mocked classname */}

                      <InputMutation
                        className={mut.id === selectedMutation?.id ? 'inputMutationSelected' : ''}
                      >
                        {mut.id === selectedMutation?.id ? (
                          <MutationVersionDropdown
                            expanded={expandedVersion}
                            toggleDropdown={toggleDropdown}
                            mutationId={selectedMutation.id}
                          />
                        ) : null}
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
                            mut.id === selectedMutation?.id ? 'authorMutationSelected' : ''
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
