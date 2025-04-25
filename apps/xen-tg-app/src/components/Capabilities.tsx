import SyncIcon from '@/assets/sync'
import ExternalLinkIcon from '../assets/external-link'
import { TAgent } from '../types'
import Agent from './Agent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const queryFn =
  (
    tgDataStr: string,
    tgDataObj: WebAppInitData,
    name: string,
    params?: { [key: string]: string | number }
  ) =>
  async () => {
    if (!tgDataStr) {
      throw new Error('Telegram is not available')
    }
    const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JSON.stringify(tgDataObj)}`,
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
  const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`,
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
  const tgDataStr = window.Telegram.WebApp.initData
  const tgDataObj = window.Telegram.WebApp.initDataUnsafe

  const { data: capabilities } = useQuery<{ items: TAgent[]; total: number }>({
    queryKey: ['capabilities', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getCapabilities', {
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

  const openNearAI = () => window.Telegram.WebApp.openLink('https://app.near.ai/agents')

  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      <div className="my-1.5 flex w-full items-center justify-between">
        <div className="flex items-center justify-between gap-1">
          <h1 className="text-center text-2xl font-bold">Capabilities</h1>
          <button
            disabled={handleUpdateCapability.isPending}
            className={`${handleUpdateCapability.isPending ? 'animate-spin-back' : ''} flex cursor-pointer items-center justify-between p-1.5 text-[#7A818B] transition ${handleUpdateCapability.isPending ? '' : 'hover:text-(--color-main-text)'}`}
            onClick={() => {
              handleUpdateCapability.mutate({
                methodName: 'syncCapabilities',
                params: {},
              })
            }}
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
