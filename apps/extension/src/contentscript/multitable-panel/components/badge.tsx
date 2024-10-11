import React, { FC } from 'react'
import styled from 'styled-components'

const Wrapper = styled.span<{ $theme: 'yellow' | 'blue' | 'white'; $margin: string }>`
  display: inline-flex;
  text-transform: uppercase;
  padding: 2px;
  border-radius: 4px;
  line-height: 1;
  background: ${(props) =>
    props.$theme === 'yellow' ? '#FAC20A' : props.$theme === 'blue' ? '#384BFF' : '#fff'};
  color: ${(props) => (props.$theme === 'yellow' || props.$theme === 'blue' ? '#fff' : '#384BFF')};
  font-size: 8px;
  font-weight: 600;
  margin: ${(props) => props.$margin};
  align-items: center;
  justify-content: center;
`

export interface IBadgeProps {
  text: string
  theme: 'yellow' | 'blue' | 'white'
  margin: string
  onClick?: () => void
}

export const Badge: FC<IBadgeProps> = ({ text, theme, margin, onClick }) => {
  return (
    <Wrapper $margin={margin} $theme={theme} onClick={onClick}>
      {text}
    </Wrapper>
  )
}
