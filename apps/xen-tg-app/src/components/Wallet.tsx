import { API_URL } from '@/env'
import { formatNearAmount } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import LogOutIcon from '../assets/log-out'
import NEAR_ICON from '../assets/near-gray.svg'
import { Balance, RewardAmount, TXenUser } from '../types'
import HistoryMainPageModule from './HistoryMainPageModule'
import Spinner from './Spinner'

const WALLET_URL = 'https://app.mynearwallet.com/' // ToDo: hardcode

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

  const { data: rewardAmount } = useQuery<RewardAmount>({
    queryKey: ['reward-amount'],
    queryFn: queryFn('getRewardAmount'),
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

  const amountInNearRounded = useMemo(() => {
    if (!rewardAmount?.total) return null
    const amountInNear = formatNearAmount(rewardAmount.total)
    return amountInNear.slice(0, amountInNear.indexOf('.') + 4)
  }, [rewardAmount?.total])

  const availableToClaimRounded = useMemo(() => {
    if (!rewardAmount?.availableToClaim) return null
    const amountInNear = formatNearAmount(rewardAmount.availableToClaim)
    return amountInNear.slice(0, amountInNear.indexOf('.') + 4)
  }, [rewardAmount?.availableToClaim])

  return user && isLoggedIn ? (
    <div className="z-1 flex w-full flex-col gap-1 overflow-hidden rounded-xl border border-(--color-opposite-text) p-2.5 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30">
      <div className="ms-5 me-1 flex items-center justify-between gap-3 py-0.5 text-[22px]/7 font-normal wrap-anywhere">
        <a
          href={WALLET_URL}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer underline decoration-(--color-current-mix-50) underline-offset-[3px] transition hover:decoration-(--color-current-mix-20) focus:decoration-(--color-current-mix-20)"
        >
          {user.nearAccountId}
        </a>
        <button
          className="flex cursor-pointer p-1 text-(--color-gray-text) transition hover:text-(--color-main-text)"
          onClick={() => handleLogout.mutate()}
        >
          <LogOutIcon />
        </button>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2.5 gap-y-0">
        <div className="flex shrink-0 gap-2 text-[22px]/normal font-semibold">
          <img src={NEAR_ICON} alt="near" />
          {balance?.formatted.available ?? '-'}
        </div>
        <div className="flex shrink-0 flex-col text-xs/tight font-semibold text-(--color-gray-text)">
          <div className="flex gap-1">
            Total revenue:{' '}
            <span className="text-(--color-my-primary)">
              {amountInNearRounded && amountInNearRounded !== '0' ? `+${amountInNearRounded}` : '0'}
            </span>{' '}
            <img className="w-2.5" src={NEAR_ICON} alt="near" />
          </div>
          <div className="flex gap-1">
            Available to claim:{' '}
            <span className="text-(--color-my-primary)">
              {availableToClaimRounded && availableToClaimRounded !== '0'
                ? `+${availableToClaimRounded}`
                : '0'}
            </span>{' '}
            <img className="w-2.5" src={NEAR_ICON} alt="near" />
          </div>
        </div>
      </div>
      <HistoryMainPageModule />
    </div>
  ) : (
    <div className="z-1 flex w-full flex-col items-center gap-2.5 rounded-xl bg-(--color-my-primary-01) p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      {isPendingUser ? (
        <Spinner />
      ) : (
        <div className="flex w-full items-center justify-between">
          <div className="flex shrink-0 flex-col gap-1 text-xs/tight font-semibold text-(--color-gray-text)">
            {availableToClaimRounded && availableToClaimRounded !== '0' ? (
              <>
                <div className="flex flex-col text-sm text-(--color-main-text)">
                  <p>Available to claim:</p>
                  <div className="flex gap-1 text-2xl/tight">
                    <p className="text-(--color-my-primary)">{`+${availableToClaimRounded}`}</p>
                    <img className="w-4" src={NEAR_ICON} alt="near" />
                  </div>
                </div>
                <div className="flex gap-1">
                  Total revenue:{' '}
                  <span className="text-(--color-my-primary)">
                    {amountInNearRounded && amountInNearRounded !== '0'
                      ? `+${amountInNearRounded}`
                      : '0'}
                  </span>{' '}
                  <img className="w-2.5" src={NEAR_ICON} alt="near" />
                </div>
              </>
            ) : (
              <div className="flex flex-col text-sm text-(--color-main-text)">
                <p>Total revenue:</p>
                <div className="flex gap-1 text-2xl/tight">
                  <p className="text-(--color-my-primary)">
                    {amountInNearRounded || amountInNearRounded !== '0'
                      ? `+${amountInNearRounded}`
                      : '0'}
                  </p>
                  <img className="w-4" src={NEAR_ICON} alt="near" />
                </div>
              </div>
            )}
          </div>
          <button
            className="flex w-[118px] cursor-pointer flex-nowrap items-center justify-center rounded-xl bg-(--color-my-primary) py-2 text-(--color-opposite-text) dark:bg-[#f8f9ff] dark:text-(--color-opposite-text)"
            onClick={() => handleLogin.mutate()}
          >
            {handleLogin.isPending || handleLogin.isSuccess ? <Spinner /> : 'Connect'}
          </button>
        </div>
      )}
      <HistoryMainPageModule />
    </div>
  )
}

export default Wallet
