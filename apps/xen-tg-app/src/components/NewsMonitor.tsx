import PlusIcon from '@/assets/plus'
import SyncIcon from '@/assets/sync'
import { API_URL } from '@/env'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { useEffect, useState } from 'react'
import { TSubscription } from '../types'
import Header from './Header'
import Layout from './Layout'
import { NewSubscription, Subscription } from './NewsSource'
import Spinner from './Spinner'

const mutationFn = async ({
  methodName,
  params,
}: {
  methodName: string
  params?: { [key: string]: string | number }
}) => {
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
      method: methodName,
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

const queryFn = (name: string, params?: { [key: string]: string | number }) => async () => {
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

const NewsMonitor = () => {
  const queryClient = useQueryClient()
  const [showNewSubscriptionForm, setShowNewSubscriptionForm] = useState(false)

  const { data: subscriptions, isPending } = useQuery<{ items: TSubscription[]; total: number }>({
    queryKey: ['subscriptions'],
    queryFn: queryFn('getSubscriptions', {
      offset: 0,
      limit: 10,
    }),
  })

  const { data: nextScanOfSubscriptions, isPending: isPendingNextScanOfSubscriptions } = useQuery<{
    nextScanAt: string
  }>({
    queryKey: ['nextScanOfSubscriptions'],
    queryFn: queryFn('getNextScanOfSubscriptions'),
  })

  const handleUpdateSubscription = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['nextScanOfSubscriptions'] })
    },
  })

  const onUpdate = () => handleUpdateSubscription.mutate({ methodName: 'scanSubscriptions' })

  useEffect(onUpdate, [])

  return (
    <Layout>
      <Header />
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
        <div className="my-1.5 flex w-full items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-center text-2xl font-bold">News Monitor</h1>
            <div className="flex items-center justify-center gap-1 text-[12px]/[150%] text-[#7A818B]">
              Next scan:{' '}
              <button
                className="flex items-center justify-center font-semibold text-(--my-primary)"
                onClick={onUpdate}
                disabled={isPendingNextScanOfSubscriptions || handleUpdateSubscription.isPending}
              >
                {nextScanOfSubscriptions?.nextScanAt
                  ? formatDistance(new Date(nextScanOfSubscriptions.nextScanAt), new Date(), {
                      addSuffix: true,
                    })
                  : '-'}
                <div
                  className={`${isPendingNextScanOfSubscriptions || handleUpdateSubscription.isPending ? 'animate-spin-back' : ''} flex cursor-pointer items-center justify-between p-1.5 transition`}
                >
                  <SyncIcon />
                </div>
              </button>
            </div>
          </div>
          <button
            className="mr-3.5 flex cursor-pointer items-center justify-center p-1.5 text-[#7A818B] transition hover:not-disabled:text-(--color-main-text)"
            onClick={() => setShowNewSubscriptionForm(true)}
            disabled={showNewSubscriptionForm}
          >
            {isPending ? <Spinner /> : <PlusIcon />}
          </button>
        </div>
        {showNewSubscriptionForm ? (
          <NewSubscription onClose={() => setShowNewSubscriptionForm(false)} />
        ) : null}
        {subscriptions?.items.map((newsSource) => (
          <Subscription key={newsSource.id} subscription={newsSource} />
        ))}
      </div>
    </Layout>
  )
}

export default NewsMonitor
