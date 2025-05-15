import { API_URL } from '@/env'
import { useGoBack } from '@/hooks/useGoBack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TMemory } from '../types'
import Layout from './Layout'
import Memory from './Memory'
import Spinner from './Spinner'

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

const mutationFn = (name: string, params?: { [key: string]: string | number }) => async () => {
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

const Memories = () => {
  const queryClient = useQueryClient()
  const { data: memories } = useQuery<{ items: TMemory[]; total: number }>({
    queryKey: ['memories'],
    queryFn: queryFn('getMemories', {
      offset: 0,
      limit: 10,
    }),
  })

  const handleDeleteAll = useMutation({
    mutationFn: mutationFn('deleteAllMemories'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })

  useGoBack()

  return (
    <Layout>
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-(--color-opposite-text) p-2.5 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30">
        <div className="my-1.5 flex w-full items-center justify-between">
          <h1 className="text-center text-2xl font-bold">{`Memories (${memories?.total ?? '-'})`}</h1>
          <button
            className="flex w-16 cursor-pointer items-center justify-center py-1.5 text-(--color-gray-text) transition hover:not-disabled:text-(--color-main-text) hover:disabled:cursor-default"
            onClick={() => handleDeleteAll.mutate()}
            disabled={!memories || !memories.total}
          >
            {handleDeleteAll.isPending ? <Spinner /> : 'Clear all'}
          </button>
        </div>
        {memories?.items.map((memory) => <Memory key={memory.data} memory={memory} />)}
      </div>
    </Layout>
  )
}

export default Memories
