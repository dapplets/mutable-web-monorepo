import { useMutation } from '@tanstack/react-query'
import { Avatar, Badge, Button, Card, Flex, Space, Typography } from 'antd'
import { FC, useContext } from 'react'
import { NearContext } from './near'

const networkConfigs = {
  mainnet: {
    networkId: 'mainnet',
    nodeUrl: 'https://mainnet.near.dapplets.org',
    walletUrl: 'https://app.mynearwallet.com',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
    socialDbContract: 'social.near',
    avatarUrl: 'https://i.near.social/magic/thumbnail/https://near.social/magic/img/account',
  },
}

export const Navigation: FC = () => {
  const networkId = 'mainnet'
  const { signedAccountId, wallet } = useContext(NearContext)

  const { mutate: signIn, isPending: isSigningIn } = useMutation({
    mutationFn: wallet.signIn,
  })

  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: wallet.signOut,
  })

  const handleDisconnectClick = () => {
    signOut()
  }

  const handleConnectClick = () => {
    signIn()
  }
  return (
    <Flex gap="middle" vertical>
      {signedAccountId ? (
        <>
          <Card size="small">
            <Flex justify="space-between" align='center'>
              <Flex gap="small" justify="flex-start" align="center">
                <Avatar
                  size={48}
                  src={`${networkConfigs[networkId].avatarUrl}/${signedAccountId}`}
                />
                <Flex vertical>
                  <Typography.Text strong>{signedAccountId}</Typography.Text>
                  <Space>
                    <Badge status="success" />
                    <Typography.Text>{networkId}</Typography.Text>
                  </Space>
                </Flex>
              </Flex>
              <Button onClick={handleDisconnectClick} loading={isSigningOut}>
                Disconnect
              </Button>
            </Flex>
          </Card>
        </>
      ) : (
        <Card size="small">
          <Flex gap="small" justify="space-between" align="center">
            <Typography.Text strong>No wallet connected</Typography.Text>
            <Button type="primary" onClick={handleConnectClick} loading={isSigningIn}>
              Connect
            </Button>
          </Flex>
        </Card>
      )}
    </Flex>
  )
}
