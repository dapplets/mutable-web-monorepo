import React, { FC, ReactNode } from 'react'
import { Flex } from 'antd'

export const Layout: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <Flex style={{ padding: 16 }} vertical justify="center" align="center" gap="middle">
      {children}
    </Flex>
  )
}
