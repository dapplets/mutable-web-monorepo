import { API_URL } from '@/env'
import { useQuery } from '@tanstack/react-query'
import { THistoryNote } from '../types'
import { Accordion } from '@/components/ui/accordion'
import { useGoBack } from '@/hooks/useGoBack'
import HistoryNote from './HistoryNote'

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

const History = () => {
  const { data: history } = useQuery<{ items: THistoryNote[]; total: number }>({
    queryKey: ['history'],
    queryFn: queryFn('getUsageHistory', {
      offset: 0,
      limit: 100,
    }),
  })

  useGoBack()

  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-(--color-opposite-text) p-2.5 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30">
      <div className="my-1.5 flex w-full items-center justify-between">
        <h1 className="text-center text-2xl font-bold">History</h1>
      </div>
      {history ? (
        <Accordion type="multiple" className="flex w-full flex-col gap-2.5">
          {history.items.map((note) => (
            <HistoryNote key={note.id} note={note} />
          ))}
        </Accordion>
      ) : null}
    </div>
  )
}

export default History
