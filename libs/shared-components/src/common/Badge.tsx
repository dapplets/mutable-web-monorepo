import React, { FC, useRef, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.span<{ $theme: 'yellow' | 'blue' | 'white' }>`
  display: inline-flex;
  text-transform: uppercase;
  padding: 2px;
  border-radies: 4px;
  background: ${(props) =>
    props.$theme === 'yellow' ? '#FAC20A' : props.$theme === 'blue' ? '#384BFF' : '#fff'};
  color: ${(props) => (props.$theme === 'yellow' || props.$theme === 'blue' ? '#fff' : '#384BFF')};
  font-size: 8px;
  font-weight: 600;
`

export interface IBadgeProps {
  text: string
  theme: 'yellow' | 'blue' | 'white'
}

const Badge: FC<IBadgeProps> = ({ text, theme }) => {
  return <Wrapper $theme={theme}>{text}</Wrapper>
}

export default Badge
