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
  OpenList,
  OpenListDefault,
  SelectedMutationBlock,
  SelectedMutationDescription,
  SelectedMutationId,
  SelectedMutationInfo,
  StarSelectedMutationWrapper,
  WrapperDropdown,
} from '../assets/stylesDropdown'
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

import { MutationWithSettings } from 'mutable-web-engine/dist/providers/provider'
import { useMutableWeb } from '../../contexts/mutable-web-context'
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
    stopEngine,
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
    stopEngine()
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
          {/* <SimpleBar style={{ maxHeight: 500, overflowX: 'hidden' }}> */}
          <ButtonListBlock>
            <ButtonBack onClick={handleOriginalButtonClick}>{<Back />} to Original</ButtonBack>
            <ButtonMutation onClick={handleMutateButtonClick}>Mutate {<Mutate />}</ButtonMutation>
          </ButtonListBlock>

          {recentlyUsedMutations.length > 0 ? (
            <ListMutations>
              {recentlyUsedMutations.map((mut) => (
                <InputBlock key={mut.id} isActive={mut.id === selectedMutation?.id}>
                  <ImageBlock>
                    <Image image={mut.metadata.image} />
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
            </ListMutations>
          ) : null}

          {unusedMutations.length > 0 ? (
            <AvalibleMutations>
              <AvalibleLableBlock>
                <AvalibleLable>available</AvalibleLable>
                {/* todo: mock */}
                <AvalibleArrowBlock
                  className={isAccordeonExpanded ? 'iconRotate' : ''}
                  onClick={handleAccordeonClick}
                >
                  <AvalibleArrowLable>{unusedMutations.length} mutations</AvalibleArrowLable>
                  <AvailableIcon />
                </AvalibleArrowBlock>
              </AvalibleLableBlock>

              {isAccordeonExpanded
                ? unusedMutations.map((mut) => (
                    <InputBlock
                      key={mut.id}
                      isActive={mut.id === selectedMutation?.id}
                      onClick={() => handleMutationClick(mut.id)}
                      className="avalibleMutationsInput"
                    >
                      <ImageBlock>
                        <Image image={mut.metadata.image} />
                      </ImageBlock>
                      <InputInfoWrapper>
                        <InputMutation>{mut.metadata ? mut.metadata.name : ''}</InputMutation>
                        <AuthorMutation>{mut.id}</AuthorMutation>
                      </InputInfoWrapper>
                    </InputBlock>
                  ))
                : null}
              {isAccordeonExpanded
                ? unusedMutations.map((mut) => (
                    <InputBlock
                      key={mut.id}
                      isActive={mut.id === selectedMutation?.id}
                      onClick={() => handleMutationClick(mut.id)}
                      className="avalibleMutationsInput"
                    >
                      <ImageBlock>
                        <Image image={mut.metadata.image} />
                      </ImageBlock>
                      <InputInfoWrapper>
                        <InputMutation>{mut.metadata ? mut.metadata.name : ''}</InputMutation>
                        <AuthorMutation>{mut.id}</AuthorMutation>
                      </InputInfoWrapper>
                    </InputBlock>
                  ))
                : null}
            </AvalibleMutations>
          ) : null}
          {/* </SimpleBar> */}
        </MutationsList>
      )}
    </WrapperDropdown>
  )
}
