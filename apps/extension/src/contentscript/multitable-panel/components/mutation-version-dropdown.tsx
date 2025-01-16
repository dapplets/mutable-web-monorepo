import { useMutableWeb } from '@mweb/engine'
import { useMutationVersions } from '@mweb/react-engine'
import React from 'react'
import { FC } from 'react'
import {
  DropdownContainer,
  DropdownItem,
  OpenList,
  OpenListDefault,
  SpanStyled,
} from '../assets/styles-dropdown'
import { IconDropdown } from '../assets/vectors'

const LatestKey = 'latest'

export const MutationVersionDropdown: FC<{
  mutationId: string | null
  toggleDropdown: () => void
  expanded: boolean
  isWhite?: boolean
}> = ({ mutationId, isWhite, toggleDropdown, expanded }) => {
  const {
    switchMutationVersion,
    selectedMutation,
    mutationVersions: currentMutationVersions,
  } = useMutableWeb()
  const { mutationVersions, areMutationVersionsLoading } = useMutationVersions(mutationId)

  if (!mutationId) {
    return null
  }

  if (!selectedMutation || areMutationVersionsLoading) {
    return <span></span>
  }

  const handleChange = (key: string) => {
    if (selectedMutation?.id) {
      switchMutationVersion(selectedMutation?.id, key === LatestKey ? null : key?.toString())
    }
  }

  return (
    <>
      <span
        style={{
          maxWidth: '50px',
          width: '100%',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxSizing: isWhite ? 'border-box' : undefined,
          marginLeft: isWhite ? '10px' : '',
          borderRadius: isWhite ? '4px' : '',
        }}
        onClick={toggleDropdown}
      >
        <SpanStyled $isWhite={isWhite}>
          {currentMutationVersions[mutationId]
            ? `v${currentMutationVersions[mutationId]}`
            : LatestKey}
          {mutationVersions && mutationVersions.length > 0 ? (
            expanded ? (
              <OpenList>
                <IconDropdown />
              </OpenList>
            ) : (
              <OpenListDefault>
                <IconDropdown />
              </OpenListDefault>
            )
          ) : null}
        </SpanStyled>

        {mutationVersions && mutationVersions.length > 0
          ? expanded && (
              <DropdownContainer $expanded={expanded}>
                {mutationVersions.map((version) => (
                  <DropdownItem
                    $isActiveVersion={currentMutationVersions[mutationId] == version.version}
                    onClick={() => handleChange(version.version)}
                    key={version.version}
                  >
                    v{version.version}
                  </DropdownItem>
                ))}
              </DropdownContainer>
            )
          : null}
      </span>
    </>
  )
}
