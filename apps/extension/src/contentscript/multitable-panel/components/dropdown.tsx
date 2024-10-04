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
  Trash,
} from '../assets/vectors'

import { useMutableWeb } from '@mweb/engine'
import { MutationWithSettings } from '@mweb/backend'
import defaultIcon from '../assets/images/default.svg'
import { Image } from './image'

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
    removeMutationFromRecents,
  } = useMutableWeb()

  const recentlyUsedMutations = useMemo(
    () =>
      mutations
        .filter((mut) => mut.settings.lastUsage)
        .sort((a, b) => {
          const dateA = a.settings.lastUsage ? new Date(a.settings.lastUsage).getTime() : null
          const dateB = b.settings.lastUsage ? new Date(b.settings.lastUsage).getTime() : null

          if (!dateA) return 1
          if (!dateB) return -1

          return dateB - dateB
        }),
    [mutations]
  )

  const [isAccordeonExpanded, setIsAccordeonExpanded] = useState(recentlyUsedMutations.length === 0)

  const unusedMutations = useMemo(
    () => mutations.filter((mut) => !mut.settings.lastUsage),
    [mutations]
  )

  const handleMutationClick = (mutationId: string) => {
    onVisibilityChange(false)
    switchMutation(mutationId)
  }

  // todo: mock
  const handleAccordeonClick = () => {
    setIsAccordeonExpanded((val) => !val)
  }

  const handleMutateButtonClick = () => {
    onVisibilityChange(false)
    onMutateButtonClick()
  }

  const handleFavoriteButtonClick = (mutation: MutationWithSettings) => {
    setFavoriteMutation(mutation.id === favoriteMutationId ? null : mutation.id)
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
              </SelectedMutationDescription>
              <SelectedMutationId>{selectedMutation.id}</SelectedMutationId>
            </>
          ) : (
            <SelectedMutationDescription>No mutations applied</SelectedMutationDescription>
          )}
        </SelectedMutationInfo>

        {selectedMutation ? (
          <StarSelectedMutationWrapper onClick={() => handleFavoriteButtonClick(selectedMutation)}>
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

            {recentlyUsedMutations.length > 0 ? (
              <ListMutations
                isAccordeonExpanded={isAccordeonExpanded}
                data-testid="recently-used-mutations"
                data-mweb-context-type="notch"
                data-mweb-context-parsed={JSON.stringify({ id: 'recently-used-mutations' })}
                data-mweb-context-level="system"
              >
                {recentlyUsedMutations.map((mut) => (
                  <InputBlock key={mut.id} isActive={mut.id === selectedMutation?.id}>
                    <ImageBlock>
                      <Image image={mut.metadata.image} fallbackUrl={defaultIcon} />
                    </ImageBlock>
                    <InputInfoWrapper onClick={() => handleMutationClick(mut.id)}>
                      {/* todo: mocked classname */}
                      <InputMutation
                        className={mut.id === selectedMutation?.id ? 'inputMutationSelected' : ''}
                      >
                        {mut.metadata ? mut.metadata.name : ''}
                      </InputMutation>
                      {/* todo: mocked classname */}
                      <AuthorMutation
                        className={
                          mut.id === selectedMutation?.id && mut.id === favoriteMutationId
                            ? 'authorMutationSelected'
                            : ''
                        }
                      >
                        {mut.id}
                      </AuthorMutation>
                    </InputInfoWrapper>
                    {/* todo: mocked */}

                    {mut.id === favoriteMutationId ? (
                      <InputIconWrapper onClick={() => handleFavoriteButtonClick(mut)}>
                        <StarMutationList />
                      </InputIconWrapper>
                    ) : mut.id === selectedMutation?.id ? (
                      <InputIconWrapper onClick={() => handleFavoriteButtonClick(mut)}>
                        <StarMutationListDefault />
                      </InputIconWrapper>
                    ) : (
                      <InputIconWrapper onClick={() => handleRemoveFromRecentlyUsedClick(mut)}>
                        <Trash />
                      </InputIconWrapper>
                    )}
                  </InputBlock>
                ))}
                <div
                  data-mweb-insertion-point="recently-used-mutations"
                  style={{ display: 'none' }}
                ></div>
              </ListMutations>
            ) : null}

            {unusedMutations.length > 0 ? (
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
                    <AvalibleArrowLable>{unusedMutations.length} mutations</AvalibleArrowLable>
                    <AvailableIcon />
                  </AvalibleArrowBlock>
                  <div data-mweb-insertion-point="hidden" style={{ display: 'none' }}></div>
                </AvalibleLableBlock>

                {isAccordeonExpanded ? (
                  <div data-testid="unused-mutations">
                    {unusedMutations.map((mut) => (
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
                          <AuthorMutation>{mut.id}</AuthorMutation>
                        </InputInfoWrapper>
                      </InputBlock>
                    ))}
                  </div>
                ) : null}
              </AvalibleMutations>
            ) : null}
          </MutationsListWrapper>
        </MutationsList>
      )}
    </WrapperDropdown>
  )
}
