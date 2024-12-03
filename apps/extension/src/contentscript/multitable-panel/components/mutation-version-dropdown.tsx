import { useMutableWeb, useMutationVersions } from '@mweb/engine'
import React, { useState } from 'react'
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
  isWhite?: boolean
}> = ({ mutationId, isWhite }) => {
  const {
    switchMutationVersion,
    selectedMutation,
    mutationVersions: currentMutationVersions,
  } = useMutableWeb()
  const { mutationVersions, areMutationVersionsLoading } = useMutationVersions(mutationId)
  const [expanded, setExpanded] = useState(false)
  const toggleDropdown = () => setExpanded(!expanded)
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
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: isWhite ? '1px solid #384BFF' : '',
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
          {expanded ? (
            <OpenList>
              <IconDropdown />
            </OpenList>
          ) : (
            <OpenListDefault>
              <IconDropdown />
            </OpenListDefault>
          )}
        </SpanStyled>

        {expanded && (
          <DropdownContainer $expanded={expanded}>
            {mutationVersions.map((version) => (
              <DropdownItem onClick={() => handleChange(version.version)} key={version.version}>
                v{version.version}
              </DropdownItem>
            ))}
          </DropdownContainer>
        )}
      </span>
    </>
  )
}
