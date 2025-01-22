import { Drawer } from 'antd'
import React, { FC } from 'react'
import { SidePanel } from './side-panel'
import { UberSausage } from './uber-sausage'
import styled from 'styled-components'

interface IMiniOverlayProps {}

// ToDo: imitation of behavior of AntDesign's Drawer
const UberSausageWrapper = styled.div<{ isOpen: boolean }>`
  z-index: 1010; // over the drawer's shadow (1000) and NearSocial's navbar (900), under overlay mask (2030)
  transition: all 0.3s;
  right: ${({ isOpen }) => (isOpen ? '360px' : '0px')};
  top: 68px;
  position: fixed;
`

export const MiniOverlay: FC<IMiniOverlayProps> = ({}) => {
  const [isOpen, setOpen] = React.useState(false)

  const handleToggleOverlay = () => {
    setOpen((val) => !val)
  }

  return (
    <>
      <Drawer
        data-testid="side-panel"
        data-mweb-insertion-point="mweb-overlay"
        placement="right"
        open={isOpen}
        closable={false}
        mask={false}
        width={360}
        destroyOnClose
        getContainer={false}
        rootStyle={{ position: 'fixed' }}
        styles={{
          body: { padding: 10 },
          wrapper: { background: '#F8F9FF' },
        }}
      >
        <SidePanel />
      </Drawer>
      <UberSausageWrapper isOpen={isOpen}>
        <UberSausage onToggleOverlay={handleToggleOverlay} />
      </UberSausageWrapper>
    </>
  )
}
