import styled from 'styled-components'
import React, { FC } from 'react'

const Component = styled.div`
  display: inline-block;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #02193a;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  font-family: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
`

export const ProfileAddress: FC<{
  children: React.ReactElement | React.ReactElement[] | string
  styles?: React.CSSProperties
}> = ({ children, styles }) => <Component style={styles}>{children}</Component>
