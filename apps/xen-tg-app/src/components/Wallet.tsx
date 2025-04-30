import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import LogOutIcon from '../assets/log-out'
import NEAR_ICON from '../assets/near-gray.svg'
import { Balance, TXenUser } from '../types'
import Spinner from './Spinner'
import { API_URL } from '@/env'

const queryFn = (name: string, isLoggedIn?: boolean) => async () => {
  if (isLoggedIn === false) return
  if (!window.Telegram.WebApp.initData) {
    throw new Error('Telegram is not available')
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${window.Telegram.WebApp.initData}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: name,
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

const mutationFn = (name: string) => async () => {
  if (!window.Telegram.WebApp.initData) {
    throw new Error('Telegram is not available')
  }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${window.Telegram.WebApp.initData}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: name,
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

const Wallet = () => {
  const queryClient = useQueryClient()
  const { isPending: isPendingUser, data: user } = useQuery<TXenUser>({
    queryKey: ['user'],
    queryFn: queryFn('getCurrentUser'),
  })

  const isLoggedIn = !!user?.nearAccountId

  const { data: balance } = useQuery<Balance>({
    queryKey: ['balance', isLoggedIn],
    queryFn: queryFn('getBalance', isLoggedIn),
  })

  const handleLogout = useMutation({
    mutationFn: mutationFn('logout'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
    },
  })

  const handleLogin = useMutation({
    mutationFn: mutationFn('login'),
    onSuccess: (result) => {
      window.Telegram.WebApp.openLink(result.url)
      setTimeout(() => window.Telegram.WebApp.close(), 1000)
    },
  })

  return user && isLoggedIn ? (
    <div className="z-1 flex w-full flex-wrap items-center justify-between gap-2.5 overflow-hidden rounded-xl border border-[#f8f9ff66] px-2.5 py-4 backdrop-blur-3xl backdrop-opacity-80">
      <div className="flex shrink-0 justify-between gap-3 text-[22px]/[150%] font-semibold">
        <img src={NEAR_ICON} alt="near" />
        {balance?.formatted.available ?? '-'}
      </div>
      <div className="me-3 flex items-center justify-between gap-3 text-[22px]/[150%] font-normal wrap-anywhere">
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
    <div
      className={`z-1 flex w-full items-center ${isPendingUser ? 'justify-center' : 'justify-between'} gap-2.5 rounded-xl bg-(--color-my-primary-01) px-2.5 py-4`}
    >
      {isPendingUser ? (
        <Spinner />
      ) : (
        <>
          <div className="text-[18px]/[150%] font-semibold">No wallet connected</div>
          <button
            className="flex w-[118px] cursor-pointer flex-nowrap items-center justify-center rounded-xl bg-(--color-my-primary) py-2 text-(--color-opposite-text) dark:bg-[#f8f9ff] dark:text-(--color-opposite-text)"
            onClick={() => handleLogin.mutate()}
          >
            {handleLogin.isPending || handleLogin.isSuccess ? <Spinner /> : 'Connect'}
          </button>
        </>
      )}
    </div>
  )
}

export default Wallet
