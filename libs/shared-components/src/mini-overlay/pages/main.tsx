import React, { FC } from 'react'
import styled from 'styled-components'
import { Dropdown } from '../../multitable-panel/components/dropdown'

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
`

export interface IMainProps {}

const Main: FC<IMainProps> = ({}) => {
  return (
    <MainContainer data-testid="main-page">
      <Dropdown />
    </MainContainer>
  )
}

export default Main
