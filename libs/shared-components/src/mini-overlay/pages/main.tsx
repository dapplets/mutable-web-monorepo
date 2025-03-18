import React, { FC } from 'react'
import styled from 'styled-components'
import { Dropdown } from '../../multitable-panel/components/dropdown'
import PageLayout from '../components/page-layout'

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
`

export interface IMainProps {}

const Main: FC<IMainProps> = ({}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <PageLayout ref={ref} title="Main">
      <MainContainer data-testid="main-page">
        <Dropdown />
      </MainContainer>
    </PageLayout>
  )
}

export default Main
