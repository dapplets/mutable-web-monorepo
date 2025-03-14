import styled from 'styled-components'
import React, { FC } from 'react'

const Component = styled.div`
  display: inline-block;
  box-sizing: border-box;
  font-size: 12px;
  color: #7a818b;
  position: relative;
  font-family: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
  text-transform: capitalize;

  &.connected,
  &.error {
    padding-left: 12px !important;

    &::before {
      position: absolute;
      content: '';
      display: block;
      top: 3px;
      left: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }

  &.connected::before {
    background: #6bea87;
  }

  &.error::before {
    background: #f44336;
  }
`

export const ProfileNetwork: FC<{
  children: React.ReactElement | React.ReactElement[] | string
  indicatorType?: 'connected' | 'error' | 'no indicator'
}> = ({ children, indicatorType = 'connected' }) => (
  <Component className={indicatorType}>{children}</Component>
)
