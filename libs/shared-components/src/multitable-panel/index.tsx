import { Space } from 'antd'
import React, { FC } from 'react'
import styled from 'styled-components'
import { Dropdown } from './components/dropdown'

const FeedContainer = styled(Space)`
  height: auto;
  transition: all 0.2s ease;
  width: 100%;
  gap: 10px;
`

const MultitablePanel: FC<{}> = ({}) => {
  return (
    <FeedContainer prefixCls="notifyWrapper" direction="vertical">
      <Dropdown />
    </FeedContainer>
  )
}

export default MultitablePanel
