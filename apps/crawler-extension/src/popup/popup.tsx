import { ControlOutlined, LogoutOutlined, WifiOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, Badge, Card, Flex, Layout, Space, Typography, Button } from 'antd'
import React, { FC } from 'react'
import browser from 'webextension-polyfill'
import Background from '../common/background'
import { networkConfigs } from '../common/networks'
import { utils } from 'near-api-js'

export const Popup: FC = () => {
  const queryClient = useQueryClient()

  const { data: networkId } = useQuery({
    queryKey: ['networkId'],
    queryFn: Background.getCurrentNetwork,
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: Background.near_getAccounts,
  })

  const { data: contextCount } = useQuery({
    queryKey: ['contextCount'],
    queryFn: Background.getContextCount,
    refetchInterval: 1000,
  })

  const { data: claimableAmount, isFetching: isClaimableAmountFetching } = useQuery({
    queryKey: ['claimableAmount'],
    queryFn: Background.getAvailableToClaimAmount,
    initialData: '0',
  })

  const { data: potentialAmount } = useQuery({
    queryKey: ['potentialAmount'],
    queryFn: Background.getPotentialAmount,
    initialData: '0',
    refetchInterval: 1000,
  })

  const [account] = accounts ?? []

  const { mutate: connectWallet, isPending: isWalletConnecting } = useMutation({
    mutationFn: Background.connectWallet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })

  const { mutate: disconnectWallet, isPending: isWalletDisconnecting } = useMutation({
    mutationFn: Background.disconnectWallet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })

  const { mutate: claimTokens, isPending: isClaiming } = useMutation({
    mutationFn: Background.claimTokens,
  })

  const handleSidePanelButtonClick = async () => {
    const [currentTab] = await browser.tabs.query({ currentWindow: true, active: true })
    // @ts-ignore
    await browser.sidePanel.open({ tabId: currentTab.id, windowId: currentTab.windowId })
    window.close()
  }

  const handleConnectButtonClick = () => {
    connectWallet()
  }

  const handleLogoutButtonClick = () => {
    disconnectWallet()
  }

  const handleClaimClick = () => {
    claimTokens()
  }

  if (!networkId) return null

  return (
    <Layout style={{ width: 300, padding: 16 }}>
      <Flex gap="middle" vertical>
        {account ? (
          <Card size="small">
            <Flex gap="small" justify="flex-start" align="center">
              <Avatar
                size={48}
                src={`${networkConfigs[networkId].avatarUrl}/${account.accountId}`}
              />
              <Flex vertical>
                <Typography.Text strong>{account.accountId}</Typography.Text>
                <Space>
                  <Badge status="success" />
                  <Typography.Text>{networkId}</Typography.Text>
                </Space>
              </Flex>
            </Flex>
          </Card>
        ) : (
          <Card size="small">
            <Flex gap="small" justify="space-between" align="center">
              <Typography.Text strong>No wallet connected</Typography.Text>
              <Button
                type="primary"
                onClick={handleConnectButtonClick}
                loading={isWalletConnecting}
              >
                Connect
              </Button>
            </Flex>
          </Card>
        )}
        <Flex gap="small" justify="center">
          <Card size="small" style={{ flex: 1 }}>
            <Card.Meta title={contextCount?.toString()} description="Items parsed" />
          </Card>
          <Card size="small" style={{ flex: 1 }}>
            <Card.Meta
              title={`${utils.format.formatNearAmount(potentialAmount)} NEAR`}
              description="Expected"
            />
          </Card>
        </Flex>

        <Card size="small" style={{ flex: 1 }}>
          {isClaimableAmountFetching ? (
            <Card.Meta title="Loading..." description="Available to claim" />
          ) : (
            <Flex gap="small" justify="space-between" align="center">
              <Card.Meta
                title={`${utils.format.formatNearAmount(claimableAmount)} NEAR`}
                description="Available to claim"
              />
              {claimableAmount !== '0' ? (
                <Button
                  type="primary"
                  onClick={handleClaimClick}
                  loading={isClaiming}
                  disabled={!account}
                >
                  Claim
                </Button>
              ) : null}
            </Flex>
          )}
        </Card>
        <Flex vertical gap="small" style={{ width: '100%' }}>
          <Button block icon={<ControlOutlined />} onClick={handleSidePanelButtonClick}>
            Open side panel
          </Button>
          {/* <Button block icon={<WifiOutlined />}>
            Allowed websites
          </Button> */}
          {account ? (
            <Button
              block
              icon={<LogoutOutlined />}
              onClick={handleLogoutButtonClick}
              loading={isWalletDisconnecting}
            >
              Logout
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Layout>
  )
}
