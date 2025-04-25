import Trash from '../assets/trash'
import { TWarning } from '../types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import Spinner from './Spinner'

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

const Warnings = () => {
  const queryClient = useQueryClient()
  const tgDataStr = window.Telegram.WebApp.initData
  const tgDataObj = window.Telegram.WebApp.initDataUnsafe

  const { data: warnings } = useQuery<{ items: TWarning[]; total: number }>({
    queryKey: ['warnings', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getWarnings', {
      offset: 0,
      limit: 10,
    }),
  })

  const handleDeleteAll = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warnings'] })
    },
  })

  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">Warnings</h1>
        <button
          disabled={!warnings?.items.length}
          className={`me-3 flex h-5 w-5 cursor-pointer items-center justify-center text-[#7A818B] transition ${warnings?.items.length ? 'hover:text-(--color-main-text)' : ''}`}
          onClick={() => handleDeleteAll.mutate({ methodName: 'deleteAllWarnings' })}
        >
          {handleDeleteAll.isPending ? <Spinner /> : <Trash />}
        </button>
      </div>
      {warnings?.items.map((warning) => (
        <div key={warning.title} className="flex w-full items-center justify-between">
          <div className="flex py-2.75 text-[14px]/[100%] font-normal text-(--color-main-text)">
            {warning.title}
          </div>
          <div className="me-2.5 flex text-[14px]/[100%] font-normal text-(--color-gray-text)">
            {formatDistance(new Date(warning.createdAt), new Date(), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Warnings
