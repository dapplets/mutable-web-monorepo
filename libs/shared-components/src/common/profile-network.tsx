import styled from 'styled-components'
import React, { FC } from 'react'

const Component = styled.div`
  display: inline-block;
  box-sizing: border-box;
  font-size: 12px;
  color: #7a818b;
  position: relative;
  padding-left: 12px !important;
  font-family: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;

  &::before {
    position: absolute;
    content: '';
    display: block;
    top: 3px;
    left: 0;
    background: #6bea87;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`

export const ProfileNetwork: FC<{
  children: React.ReactElement | React.ReactElement[] | string
}> = ({ children }) => <Component>{children}</Component>
