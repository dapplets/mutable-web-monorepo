import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { FC } from 'react'
import Trash from '../assets/trash'
import { TMemory } from '../types'
import Spinner from './Spinner'
import { API_URL } from '@/env'

const mutationFn = (name: string, params?: { [key: string]: string | number }) => async () => {
  if (!window.Telegram.WebApp.initData) {
    throw new Error('Telegram is not available')
  }
  const response = await fetch(API_URL, {
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

type TMemoryProps = {
  memory: TMemory
}

const Memory: FC<TMemoryProps> = ({ memory }) => {
  const queryClient = useQueryClient()

  const handleDelete = useMutation({
    mutationFn: mutationFn('deleteMemory', {
      id: memory.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] })
    },
  })

  return (
    <div className="flex w-full items-center justify-between gap-3.5 rounded-[10px] bg-(--color-light-white-bg) p-2.5">
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex py-0.25 text-[12px]/[100%] font-normal text-(--color-gray-text)">
          {formatDistance(new Date(memory.datetime), new Date(), { addSuffix: true })}
        </div>
        <div className="flex py-0.25 text-[14px]/[150%] font-semibold">{memory.data}</div>
      </div>
      <button
        className="mr-1 flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
        onClick={() => handleDelete.mutate()}
      >
        {handleDelete.isPending || handleDelete.isSuccess ? <Spinner /> : <Trash />}
      </button>
    </div>
  )
}

export default Memory
