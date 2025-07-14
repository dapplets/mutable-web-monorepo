import PlusIcon from '@/assets/plus'
import StarsIcon from '@/assets/stars'
import SyncIcon from '@/assets/sync'
import { Switch } from '@/components/ui/switch'
import { API_URL } from '@/env'
import { useGoBack } from '@/hooks/useGoBack'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { useEffect, useRef, useState } from 'react'
import { TSubscription } from '../types'
import Layout from './Layout'
import { NewSubscription, Subscription } from './NewsSource'
import Spinner from './Spinner'

const PAGE_LIMIT = 10

async function query<T, U>(name: string, params: T): Promise<U> {
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

const queryFn =
  (name: string) =>
  async ({
    pageParam,
  }: {
    pageParam: {
      offset: number
      limit: number
    }
  }): Promise<{ total: number; items: TSubscription[] | null | undefined }> =>
    query<
      { offset: number; limit: number },
      { total: number; items: TSubscription[] | null | undefined }
    >(name, pageParam)

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

const NewsMonitor = () => {
  const queryClient = useQueryClient()
  const [showNewSubscriptionForm, setShowNewSubscriptionForm] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const {
    data: subscriptions,
    // error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    // status,
  } = useInfiniteQuery({
    queryKey: ['subscriptions'],
    queryFn: queryFn('getSubscriptions'),
    initialPageParam: {
      offset: 0,
      limit: PAGE_LIMIT,
    },
    getNextPageParam: (lastPage, __, lastPageParam) => {
      if (lastPage.total <= lastPageParam.offset + lastPageParam.limit) return
      return {
        offset: lastPageParam.offset + PAGE_LIMIT,
        limit: PAGE_LIMIT,
      }
    },
  })

  const { data: nextScanOfSubscriptions, isPending: isPendingNextScanOfSubscriptions } = useQuery<{
    nextScanAt: string
  }>({
    queryKey: ['nextScanOfSubscriptions'],
    queryFn: () => query<null, { nextScanAt: string }>('getNextScanOfSubscriptions', null),
  })

  const { data: isFinderActive, isPending: isPendingIsFinderActive } = useQuery<boolean>({
    queryKey: ['isFinderActive'],
    queryFn: () => query<null, boolean>('getFinderActivityState', null),
  })

  useEffect(() => {
    const sentinelEl = sentinelRef.current
    if (!sentinelEl) return
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) fetchNextPage()
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    )

    observerRef.current.observe(sentinelEl)
    return () => {
      observerRef.current?.disconnect()
    }
  }, [isFetchingNextPage, fetchNextPage, hasNextPage])

  const handleUpdateSubscription = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['nextScanOfSubscriptions'] })
    },
  })

  const handleChangeFinderStatus = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['isFinderActive'] })
    },
  })

  useEffect(() => handleChangeFinderStatus.reset(), [isFinderActive])

  useGoBack()

  return (
    <Layout>
      <div className="z-1 flex w-full items-center justify-between gap-2.5 px-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-between">
            {isPendingIsFinderActive || handleChangeFinderStatus.isPending ? (
              <Spinner />
            ) : (
              <StarsIcon />
            )}
          </div>
          <div className="text-[18px]/[150%] font-normal">AI channel discovery</div>
        </div>
        <div className="flex items-center px-2">
          <Switch
            onCheckedChange={() =>
              handleChangeFinderStatus.mutate({
                methodName: isFinderActive ? 'disableFinder' : 'enableFinder',
              })
            }
            checked={isFinderActive}
            disabled={
              isPendingIsFinderActive ||
              handleChangeFinderStatus.isPending ||
              handleChangeFinderStatus.isSuccess
            }
          />
        </div>
      </div>
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-(--color-opposite-text) p-2.5 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30">
        <div className="my-1.5 flex w-full items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-center text-2xl font-bold">News Monitor</h1>
            <div className="flex items-center justify-center gap-1 text-[12px]/[150%] text-(--color-gray-text)">
              Next scan:{' '}
              <button
                className="flex items-center justify-center font-semibold text-(--my-primary)"
                onClick={() => handleUpdateSubscription.mutate({ methodName: 'scanSubscriptions' })}
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
            className="mr-1.5 flex h-12 w-12 cursor-pointer items-center justify-center p-1.5 text-(--color-gray-text) transition hover:not-disabled:text-(--color-main-text)"
            onClick={() => setShowNewSubscriptionForm(true)}
            disabled={showNewSubscriptionForm}
          >
            {isFetching ? <Spinner /> : <PlusIcon />}
          </button>
        </div>
        {showNewSubscriptionForm ? (
          <NewSubscription onClose={() => setShowNewSubscriptionForm(false)} />
        ) : null}
        {subscriptions?.pages.map((group) =>
          group?.items
            ?.filter((newsSource) => !newsSource.isByFinder || isFinderActive)
            .map((newsSource) => <Subscription key={newsSource.id} subscription={newsSource} />)
        )}
        <div ref={sentinelRef} />
        {hasNextPage ? (
          <div className="flex h-10 w-full justify-center">
            {isFetching || isFetchingNextPage ? <Spinner /> : null}
          </div>
        ) : null}
      </div>
    </Layout>
  )
}

export default NewsMonitor
