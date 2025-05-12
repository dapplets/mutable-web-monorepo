import { API_URL } from '@/env'
import { THistoryNote } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import ArrayRightIcon from '../assets/array-right'
import { HistoryCard } from './HistoryNote'

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

const HistoryMainPageModule = () => {
  const { data: history } = useQuery<{ items: THistoryNote[]; total: number }>({
    queryKey: ['history'],
    queryFn: queryFn('getUsageHistory', {
      offset: 0,
      limit: 1,
    }),
  })

  return history?.total ? (
    <Link
      to="/history"
      className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 text-(--color-main-text) backdrop-blur-3xl backdrop-opacity-80"
    >
      <HistoryCard note={history?.items[0]} />
      <div className="mr-6 flex cursor-pointer items-center justify-center py-1.5">
        <ArrayRightIcon />
      </div>
    </Link>
  ) : null
}

export default HistoryMainPageModule
