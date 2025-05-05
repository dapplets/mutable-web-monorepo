import SyncIcon from '@/assets/sync'
import { API_URL } from '@/env'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import ExternalLinkIcon from '../assets/external-link'
import { TAgent } from '../types'
import Agent from './Agent'
import Spinner from './Spinner'

const PAGE_LIMIT = 10

const queryFn =
  (name: string) =>
  async ({
    pageParam,
  }: {
    pageParam: {
      offset: number
      limit: number
    }
  }): Promise<{ total: number; items: TAgent[] | null | undefined }> => {
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
        params: pageParam ?? {},
        id: 1,
      }),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.result
  }

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

const Capabilities = () => {
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const {
    data: capabilities,
    // error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    // status,
  } = useInfiniteQuery({
    queryKey: ['capabilities'],
    queryFn: queryFn('getCapabilities'),
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

  const queryClient = useQueryClient()

  const handleUpdateCapability = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] })
    },
  })

  useEffect(() => handleUpdateCapability.mutate({ methodName: 'syncCapabilities' }), [])

  const openNearAI = () => window.Telegram.WebApp.openLink('https://app.near.ai/agents')

  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      <div className="my-1.5 flex w-full items-center justify-between">
        <div className="flex items-center justify-between gap-1">
          <h1 className="text-center text-2xl font-bold">Capabilities</h1>
          <button
            disabled={handleUpdateCapability.isPending}
            className={`${handleUpdateCapability.isPending ? 'animate-spin-back' : ''} flex cursor-pointer items-center justify-between p-1.5 text-[#7A818B] transition ${handleUpdateCapability.isPending ? '' : 'hover:text-(--color-main-text)'}`}
            onClick={() => handleUpdateCapability.mutate({ methodName: 'syncCapabilities' })}
          >
            <SyncIcon />
          </button>
        </div>
        <button
          role="link"
          className="me-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          onClick={openNearAI}
        >
          <ExternalLinkIcon />
        </button>
      </div>
      <Agent
        key="news-monitor"
        capabilitiy={{
          name: 'News Monitor',
          domain: 'Core',
          isEnabled: true,
          action: () => navigate('/news-monitor'),
        }}
      />
      {capabilities?.pages.map((group) =>
        group?.items?.map((capabilitiy) => (
          <Agent key={capabilitiy.name} capabilitiy={capabilitiy} />
        ))
      )}
      <div ref={sentinelRef} />
      {hasNextPage ? (
        <div className="flex h-10 w-full justify-center">
          {isFetching || isFetchingNextPage ? <Spinner /> : null}
        </div>
      ) : null}
    </div>
  )
}

export default Capabilities
