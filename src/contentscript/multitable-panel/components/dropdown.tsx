import { Engine, Mutation } from 'mutable-web-engine'
import React, { DetailedHTMLProps, FC, HTMLAttributes, useEffect, useState } from 'react'
import styled from 'styled-components'
import { setCurrentMutationId } from '../../storage'

const WrapperDropdown = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  width: 220px;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
`

const SelectedMutationBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 2px 6px;
  cursor: pointer;
`

const SelectedMutationInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 181px;
`
const SelectedMutationDescription = styled.div`
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  line-height: 149%;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-block;
`

const SelectedMutationId = styled.div`
  font-family: 'Segoe UI', sans-serif;
  font-size: 10px;
  line-height: 100%;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-block;
`

const OpenListDefault = styled.span`
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

const OpenList = styled.span`
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

const MutationsList = styled.div`
  position: absolute;
  z-index: 3;

  display: flex;
  flex-direction: column;

  padding: 6px;
  padding-top: 0;

  background: #fff;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);

  width: 225px;
  box-sizing: border-box;
  left: -2.5px;
  top: 39px;
  border-radius: 0px 0px 10px 10px;

  height: 300px;
  overflow: hidden;
  overflow-y: auto;

  @keyframes listVisible {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }
  animation: listVisible 0.2s ease forwards;
  transition: all 0.3s;
`

const Label = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: 6.5px 13px;

  font-family: 'Segoe UI', sans-serif;
  font-size: 6px;
  font-weight: 700;
  line-height: 100%;
  color: rgba(183, 188, 196, 0.6);
  text-transform: uppercase;
  box-sizing: border-box;

  &::before {
    content: '';

    position: absolute;
    top: 8px;
    left: 6px;

    display: inline-block;

    width: 60px;
    height: 1px;

    background: #b7bcc4;
    border-radius: 10px;
  }

  &::after {
    content: '';

    position: absolute;
    top: 8px;
    right: 6px;

    display: inline-block;

    width: 60px;
    height: 1px;

    background: #b7bcc4;
    border-radius: 10px;
  }
`

const InputBlock = styled.div<{ $enable?: string; $enableBefore?: string }>`
  display: flex;

  padding: 6.5px 13px;
  cursor: pointer;

  position: relative;

  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: 100%;
  padding-left: 24px;

  background: ${(props) => props.$enable || '#fff'};
  border-radius: 4px;

  &::before {
    content: '';

    position: absolute;
    top: 45%;
    left: 6px;

    display: inline-block;

    width: 8px;
    height: 8px;

    background: ${(props) => props.$enableBefore || '#e7ecef'};
    border-radius: 4px;
  }

  .inputMutation {
    background: ${(props) => props.$enable || '#fff'};
  }
`

const InputMutation = styled.span`
  font-family: 'Segoe UI', sans-serif;
  font-size: 12px;
  line-height: 149%;

  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-block;
`

const AuthorMutation = styled.div`
  font-family: 'Segoe UI', sans-serif;

  font-size: 10px;
  line-height: 100%;
  color: rgb(34 34 34 / 60%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-block;
`

const iconDropdown = (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.5">
      <path
        d="M3.25 4.875L6.5 8.125L9.75 4.875"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)

export type DropdownProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  engine: Engine
}

export const Dropdown: FC<DropdownProps> = (props: DropdownProps) => {
  const { engine } = props
  const [isOpen, setOpen] = useState(false)
  const [selectedMutation, setSelectedMutation] = useState<Mutation | null>(null)

  const [mutations, setMutations] = useState<Mutation[]>([])

  useEffect(() => {
    const init = async () => {
      const mutations = await engine.getMutations()
      setMutations(mutations)

      const mutation = await engine.getCurrentMutation()
      setSelectedMutation(mutation)
    }
    init()
  }, [engine])

  const enableMutation = async (mut: Mutation, x: (x) => void) => {
    setSelectedMutation(mut)
    x(false) // ToDo: ???
    await engine.switchMutation(mut.id)
    setCurrentMutationId(mut.id)
  }

  return (
    <WrapperDropdown
      data-testid="mutable-panel-dropdown"
      onBlur={() => {
        setOpen(false)
      }}
      tabIndex={0}
      style={{ scrollbarColor: 'rgb(147, 150, 152)  rgb(255, 255, 255)', scrollbarWidth: 'thin' }}
    >
      <SelectedMutationBlock data-testid="selected-mutation-block" onClick={() => setOpen(!isOpen)}>
        <SelectedMutationInfo>
          {selectedMutation && (
            <>
              <SelectedMutationDescription data-testid="selected-mutation-name">
                {selectedMutation.metadata.name}
              </SelectedMutationDescription>
              <SelectedMutationId data-testid="selected-mutation-id">
                {selectedMutation.id}
              </SelectedMutationId>
            </>
          )}
        </SelectedMutationInfo>

        {isOpen ? (
          <OpenList>{iconDropdown}</OpenList>
        ) : (
          <OpenListDefault>{iconDropdown}</OpenListDefault>
        )}
      </SelectedMutationBlock>

      {isOpen && (
        <MutationsList data-testid="mutatiomn-list">
          <Label>Available mutations</Label>

          {mutations.length &&
            mutations.map((mut, i) => (
              <InputBlock
                $enable={mut.id === selectedMutation?.id && '#f7f7f7'}
                $enableBefore={mut.id === selectedMutation?.id && '#34d31a'}
                onClick={() => {
                  enableMutation(mut, setOpen)
                }}
                key={i}
                data-testid={`selected-mutation-name-${mut.metadata.name}`}
              >
                <InputMutation>{mut.metadata.name}</InputMutation>
                <AuthorMutation>{mut.id}</AuthorMutation>
              </InputBlock>
            ))}
        </MutationsList>
      )}
    </WrapperDropdown>
  )
}
