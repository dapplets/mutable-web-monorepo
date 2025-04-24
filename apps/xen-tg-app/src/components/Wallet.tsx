import { FC } from 'react'
import LogOutIcon from '../assets/log-out'
import NEAR_ICON from '../assets/near-gray.svg'
import { Balance, TXenUser } from '../types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const queryFn =
  (shouldMakeRequest: boolean, name: string, params?: { [key: string]: string }) => async () => {
    if (!shouldMakeRequest) return
    if (!window.Telegram.WebApp.initData) {
      throw new Error('Telegram is not available')
    }
    const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: name,
        params: params ?? {},
        id: 1,
      }),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.result
  }

const mutationFn = async () => {
  if (!window.Telegram.WebApp.initData) {
    throw new Error('Telegram is not available')
  }
  const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'logout',
      params: {},
      id: 1,
    }),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()
  return data.result
}

type TWalletProps = {
  user: TXenUser | null
}

const Wallet: FC<TWalletProps> = ({ user }) => {
  const queryClient = useQueryClient()
  const isLoggedIn = !!user?.nearAccountId

  const {
    // isPending: isPendingBalance,
    // isError: isErrorBalance,
    data: balance,
    // error: errorBalance,
  } = useQuery<Balance>({
    queryKey: ['balance', isLoggedIn],
    queryFn: queryFn(isLoggedIn, 'getBalance'),
  })

  const handleLogout = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
    },
  })

  const handleConnect = () => {
    console.log('connect')
  }

  return user && isLoggedIn ? (
    <div className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] px-2.5 py-4 backdrop-blur-3xl backdrop-opacity-80">
      <div className="flex gap-3 text-[22px]/[150%] font-semibold">
        <img src={NEAR_ICON} alt="near" />
        {balance?.formatted.available ?? '-'}
      </div>
      <div className="me-3 flex items-center gap-3 text-[22px]/[150%] font-normal">
        {user.nearAccountId}
        <button
          className="flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          onClick={() => handleLogout.mutate()}
        >
          <LogOutIcon />
        </button>
      </div>
    </div>
  ) : (
    <div className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl bg-(--color-my-primary-01) px-2.5 py-4">
      <div className="text-[18px]/[150%] font-semibold">No wallet connected</div>
      <button
        className="flex cursor-pointer flex-nowrap rounded-xl bg-(--color-my-primary) px-8 py-2 text-(--color-opposite-text) dark:bg-[#f8f9ff] dark:text-(--color-opposite-text)"
        onClick={handleConnect}
      >
        Connect
      </button>
    </div>
  )
}

export default Wallet
