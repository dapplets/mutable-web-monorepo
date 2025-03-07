import styled from 'styled-components'
import React, { FC } from 'react'

const Component = styled.div`
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  font-family: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
`

export const ProfileInfo: FC<{
  children: React.ReactElement | React.ReactElement[]
  styles?: React.CSSProperties
}> = ({ children, styles }) => <Component style={styles}>{children}</Component>
