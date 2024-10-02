import { DocumentDto } from '@mweb/backend'
import React, { FC, useState } from 'react'
import styled from 'styled-components'
import { SimpleApplicationCard } from './application-card'
import { Button } from './button'
import { MinusCircle, PlusCircle } from '../assets/vectors'

const Wrapper = styled.div`
  position: absolute;
  z-index: 3;
  top: calc(50% - 10px);
  transform: translateY(-50%);
  left: 0;
  width: calc(100% - 20px);
  max-height: calc(100% - 20px);
  margin: 10px;
  padding: 10px;
  border: 1px solid #000;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: sans-serif;
  background: #f8f9ff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
`

const Close = styled.span`
  cursor: pointer;
  svg {
    margin: 0;
    width: 23px;
    height: 23px;

    path {
      stroke: #838891;
    }
  }
  &:hover {
    opacity: 0.5;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(2, 25, 58, 1);
  font-size: 14px;
  font-weight: 600;
  line-height: 21.09px;
  text-align: left;
  gap: 20px;

  .edit {
    margin-right: auto;
    margin-bottom: 2px;
  }
`

const Title = styled.div`
  color: #02193a;
`

const AppsList = styled.div`
  overflow: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    cursor: pointer;
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(244 244 244);
    background: linear-gradient(
      90deg,
      rgb(244 244 244 / 0%) 10%,
      rgb(227 227 227 / 100%) 50%,
      rgb(244 244 244 / 0%) 90%
    );
  }

  &::-webkit-scrollbar-thumb {
    width: 4px;
    height: 2px;
    background: #384bff;
    border-radius: 2px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 9%), 0 2px 2px rgb(38 117 209 / 4%);
  }
`

const InlineButton = styled.button`
  align-self: center;
  width: fit-content;
  border: none;
  display: flex;
  gap: 5px;
  background: none;
  color: #384bff;
  font-size: 12px;
  font-weight: 400;
  line-height: 150%;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    opacity: 0.5;
  }
`

const ButtonsBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path
      d="M21 9L9 21"
      stroke="#02193A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L21 21"
      stroke="#02193A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export interface Props {
  docs: DocumentDto[] | null
  chosenDocumentsIds: (string | null)[]
  setDocumentsIds: (ids: (string | null)[]) => void
  onClose: () => void
}

export const DocumentsModal: FC<Props> = ({
  docs,
  chosenDocumentsIds,
  setDocumentsIds,
  onClose,
}) => {
  const [chosenDocsIds, setChosenDocsIds] = useState<(string | null)[]>(chosenDocumentsIds)

  const handleDocCheckboxChange = (id: string | null) =>
    setChosenDocsIds((val) =>
      chosenDocsIds.includes(id) ? val.filter((docId) => docId !== id) : [...val, id]
    )

  return (
    <Wrapper>
      <Header>
        <Title>Select your guide</Title>
        <Close onClick={onClose}>
          <CloseIcon />
        </Close>
      </Header>

      <InlineButton onClick={() => handleDocCheckboxChange(null)}>
        {chosenDocsIds.includes(null) ? (
          <>
            <MinusCircle />
            Delete document builder
          </>
        ) : (
          <>
            <PlusCircle />
            Create from scratch
          </>
        )}
      </InlineButton>

      <AppsList>
        {docs?.map((doc) => (
          <SimpleApplicationCard
            key={doc.id}
            src={doc.id}
            metadata={doc.metadata}
            isChecked={chosenDocsIds.includes(doc.id)}
            onChange={() => handleDocCheckboxChange(doc.id)}
            disabled={false}
            iconShape="circle"
            textColor="#4E5E76"
            backgroundColor="#F8F9FF"
          />
        ))}
      </AppsList>

      <ButtonsBlock>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          primary
          disabled={hasArrayTheSameData(chosenDocsIds, chosenDocumentsIds)}
          onClick={() => {
            setDocumentsIds(chosenDocsIds)
            onClose()
          }}
        >
          Confirm
        </Button>
      </ButtonsBlock>
    </Wrapper>
  )
}

const hasArrayTheSameData = (a: (string | null)[], b: (string | null)[]) => {
  if (a.length !== b.length) {
    return false
  }

  const aMap = new Map<string | null, number>()
  const bMap = new Map<string | null, number>()

  for (const item of a) {
    aMap.set(item, (aMap.get(item) ?? 0) + 1 || 1)
  }

  for (const item of b) {
    bMap.set(item, (bMap.get(item) ?? 0) + 1 || 1)
  }

  for (const [key, value] of aMap) {
    if (bMap.get(key) !== value) {
      return false
    }
  }

  return true
}
