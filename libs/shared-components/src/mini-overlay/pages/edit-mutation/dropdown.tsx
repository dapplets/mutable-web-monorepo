import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons'
import { EntitySourceType } from '@mweb/backend'
import { useMutableWeb } from '@mweb/engine'
import React, { DetailedHTMLProps, FC, HTMLAttributes, useMemo, useState } from 'react'
import {
  OpenList,
  OpenListDefault,
  SelectedMutationBlock,
  SelectedMutationDescription,
  SelectedMutationId,
  SelectedMutationInfo,
  SpanStyled,
  StarSelectedMutationWrapper,
  WrapperDropdown,
} from './assets/styles-dropdown'
import { IconDropdown, StarSelectMutation, StarSelectMutationDefault } from './assets/vectors'
import { Badge } from './badge'
import { MutationVersionDropdown } from './mutation-version-dropdown'
import { useFavoriteMutation, useSetFavoriteMutation } from '@mweb/react-engine'

export type DropdownProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  isVisible: boolean
  onVisibilityChange: (visible: boolean) => void
  onMutateButtonClick: () => void
}

// ToDo: delete ?
export const Dropdown: FC<DropdownProps> = ({ isVisible, onVisibilityChange }: DropdownProps) => {
  const { mutations, selectedMutation, switchPreferredSource } = useMutableWeb()
  const { favoriteMutationId } = useFavoriteMutation()
  const { setFavoriteMutation } = useSetFavoriteMutation()

  // ToDo: think about this
  // The state is here to prevent closing dropdown when mutation changed
  const [expandedVersion, setExpandedVersion] = useState(false)
  const toggleDropdown = () => setExpandedVersion(!expandedVersion)

  const recentlyUsedMutations = useMemo(
    () =>
      // @ts-ignore
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

  const handleSwitchSourceClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.stopPropagation() // do not open dropdown

    if (!selectedMutation) return

    const source =
      selectedMutation.source === EntitySourceType.Local
        ? EntitySourceType.Origin
        : EntitySourceType.Local

    switchPreferredSource(selectedMutation.id, source)
  }

  const handleFavoriteButtonClick = (mutationId: string) => {
    setFavoriteMutation(mutationId === favoriteMutationId ? null : mutationId)
  }

  return (
    <WrapperDropdown>
      {selectedMutation && selectedMutation.metadata ? (
        <MutationVersionDropdown
          expanded={expandedVersion}
          toggleDropdown={toggleDropdown}
          mutationId={selectedMutation.id}
        />
      ) : (
        selectedMutation &&
        selectedMutation.metadata && <SpanStyled>v{selectedMutation.version}</SpanStyled>
      )}

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
    </WrapperDropdown>
  )
}
