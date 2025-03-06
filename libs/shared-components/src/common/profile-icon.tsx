import styled from 'styled-components'
import React, { FC } from 'react'

const Component = styled.div<{ $size: 'big' | 'medium' }>`
  display: flex;
  box-sizing: border-box;
  width: ${({ $size }) => ($size === 'big' ? '48px' : '32px')};
  height: ${({ $size }) => ($size === 'big' ? '48px' : '32px')};
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e2e2e5;
  flex-shrink: 0;

  img {
    object-fit: cover;
  }
`

export const ProfileIcon: FC<{ children: React.ReactElement; size?: 'big' | 'medium' }> = ({
  children,
  size = 'big',
}) => <Component $size={size}>{children}</Component>
