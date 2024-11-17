import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons'
import { EntitySourceType } from '@mweb/backend'
import { MutationsProvider, useMutableWeb } from '@mweb/engine'
import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react'
import {
  OpenList,
  OpenListDefault,
  SelectedMutationBlock,
  SelectedMutationDescription,
  SelectedMutationId,
  SelectedMutationInfo,
  StarSelectedMutationWrapper,
  WrapperDropdown,
} from '../assets/styles-dropdown'
import { IconDropdown, StarSelectMutation, StarSelectMutationDefault } from '../assets/vectors'
import { Badge } from './badge'
import { DropdownMenu } from './dropdown-menu'

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
  const { selectedMutation, favoriteMutationId, setFavoriteMutation, switchPreferredSource } =
    useMutableWeb()

  const handleSwitchSourceClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation() // do not open dropdown

    if (!selectedMutation) return

    const source =
      selectedMutation.source === EntitySourceType.Local
        ? EntitySourceType.Origin
        : EntitySourceType.Local

    switchPreferredSource(source)
  }

  const handleFavoriteButtonClick = (mutationId: string) => {
    setFavoriteMutation(mutationId === favoriteMutationId ? null : mutationId)
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
                {selectedMutation.settings.preferredSource ? ( // TODO: fix
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
                {selectedMutation.metadata.name} (v{selectedMutation.version})
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
        <MutationsProvider>
          <DropdownMenu
            onMutateButtonClick={onMutateButtonClick}
            onVisibilityChange={onVisibilityChange}
            onFavoriteMutationClick={handleFavoriteButtonClick}
          />
        </MutationsProvider>
      )}
    </WrapperDropdown>
  )
}
