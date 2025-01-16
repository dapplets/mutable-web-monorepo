import React, { Dispatch, FC, SetStateAction } from 'react'
import styled from 'styled-components'
import { Close } from '../mini-overlay/assets/icons'
import AccountListItem from './account-list-item'
import LinkButton from './link-button'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 10px !important;
  width: calc(100% - 20px) !important;
  padding: 10px !important;
  gap: 10px;
  border-radius: 10px !important;
  background: var(--pure-white);
  box-shadow:
    0px 4px 20px 0px #0b576f26,
    0px 4px 5px 0px #2d343c1a;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
`

const H3 = styled.h3`
  font-family: var(--font-default);
  color: var(--primary);
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 150%;
`

const ButtonClose = styled.button`
  padding: 5px !important;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--gray);
  transition: var(--transition-default);

  &:hover {
    color: var(--gray-hover);
  }

  &:active {
    color: var(--gray-active);
  }
`

const Text = styled.p`
  font-family: var(--font-default);
  color: var(--gray);
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 150%;
`

type ConnectModuleProps = {
  setShowConnectModule: Dispatch<SetStateAction<boolean>>
}

const ConnectModule: FC<ConnectModuleProps> = ({ setShowConnectModule }) => {
  return (
    <Wrapper>
      <Header>
        <H3>You can link new account</H3>
        <ButtonClose onClick={() => setShowConnectModule(false)}>
          <Close />
        </ButtonClose>
      </Header>
      <AccountListItem
        name={'@user'} // mocked
        origin={'x'}
      >
        <LinkButton onClick={() => console.log('Link!')} />
      </AccountListItem>
      <Text>
        You are on a website for which account linking is available. Do you want to link your
        account to your current cryptocurrency wallet?
      </Text>
    </Wrapper>
  )
}

export default ConnectModule
