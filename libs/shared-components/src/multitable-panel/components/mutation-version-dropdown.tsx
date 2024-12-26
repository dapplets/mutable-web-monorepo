import { useMutableWeb, useMutationVersions } from '@mweb/engine'
import React, { useState } from 'react'
import { FC } from 'react'
import { IconDropdown } from '../../mini-overlay/assets/icons'
import styled from 'styled-components'

export const SpanStyled = styled.span<{ $isWhite?: boolean; $isExpanded?: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  justify-content: ${({ $isExpanded }) => ($isExpanded ? `center` : 'flex-start')};
  padding-left: ${({ $isExpanded }) => ($isExpanded ? `4px` : '6px')};
  width: 100%;
  height: 100%;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 400;
  text-align: left;
  color: #ffffff;
  background: ${({ $isWhite }) => ($isWhite ? `#FFFFFF` : '#384bff')};

  svg path {
    stroke: ${({ $isWhite }) => ($isWhite ? ` #7a818b` : '#FFFFFF')};
  }
`

export const OpenListDefault = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @keyframes rotateIsClose {
    0% {
      transform: rotate(180deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }
  animation: rotateIsClose 0.2s ease forwards;
  transition: all 0.3s;
  &:hover {
    svg {
      transform: scale(1.2);
    }
  }
`

export const OpenList = styled.span`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  @keyframes rotateIsOpen {
    0% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(180deg);
    }
  }
  animation: rotateIsOpen 0.2s ease forwards;
  transition: all 0.3s;
  &:hover {
    svg {
      transform: scale(1.2);
    }
  }
`

export const DropdownContainer = styled.div<{ $expanded?: boolean }>`
  position: absolute;
  width: 100%;
  width: 50px;
  height: auto;
  top: 24px;
  left: 2px;
  padding: 2px;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;
  z-index: 2;

  box-shadow: ${({ $expanded }) =>
    $expanded
      ? `0px 3px 7px 0px #2222221A, 
         0px 12px 12px 0px #22222217, 
         0px 27px 16px 0px #2222220D, 
         0px 48px 19px 0px #22222203, 
         0px 76px 21px 0px #22222200`
      : 'none'};

  cursor: pointer;
`

export const DropdownItem = styled.div<{ $isActiveVersion?: boolean }>`
  font-size: 10px;
  font-weight: 400;
  text-align: right;
  color: ${({ $isActiveVersion }) => ($isActiveVersion ? `#384BFF` : '#7a818b')};
  padding: 4px;

  &:hover {
    background: #1879ce1a;
    color: #384bff;
  }
`

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
          maxWidth: mutationVersions && mutationVersions.length > 0 ? '50px' : '40px',
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
        <SpanStyled
          $isWhite={isWhite}
          $isExpanded={mutationVersions && mutationVersions.length > 0}
          className="mutation-version-dropdown"
        >
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
