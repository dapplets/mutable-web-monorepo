import SyncIcon from '@/assets/sync'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ExternalLinkIcon from '../assets/external-link'
import { TAgent } from '../types'
import Agent from './Agent'
import { API_URL } from '@/env'
import { useEffect } from 'react'

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
  const queryClient = useQueryClient()

  const { data: capabilities } = useQuery<{ items: TAgent[]; total: number }>({
    queryKey: ['capabilities'],
    queryFn: queryFn('getCapabilities', {
      offset: 0,
      limit: 10,
    }),
  })

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
          className="me-3 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          onClick={openNearAI}
        >
          <ExternalLinkIcon />
        </button>
      </div>
      {capabilities?.items.map((capabilitiy) => (
        <Agent key={capabilitiy.name} capabilitiy={capabilitiy} />
      ))}
    </div>
  )
}

export default Capabilities
