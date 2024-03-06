import { Engine } from 'mutable-web-engine'
import React, { FC } from 'react'
import styled from 'styled-components'
import { Dropdown } from './components/dropdown'

const WrapperPanel = styled.div`
  width: 100vw;
  right: 0;
  position: fixed;
  z-index: 5000;
  top: 0;
  height: 15px;
  background: transparent;
  &::before {
    content: '';
    width: 100%;
    height: 5px;
    display: block;
    background: #3d7fff;
  }

  &:hover,
  &:focus {
    .visible-north-panel {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
const NorthPanel = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 0 auto;

  width: 228px;
  height: 45px;

  padding: 4px;

  border-radius: 0 0 6px 6px;
  background: #3d7fff;
  box-sizing: border-box;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
`
interface MultitablePanelProps {
  engine: Engine
}

export const MultitablePanel: FC<MultitablePanelProps> = (props) => {
  return (
    <WrapperPanel>
      <NorthPanel className="visible-north-panel">
        <Dropdown engine={props.engine} />
      </NorthPanel>
    </WrapperPanel>
  )
}
