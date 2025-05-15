import { Accordion } from '@/components/ui/accordion'
import { API_URL } from '@/env'
import { THistoryNote } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
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

const HistoryMainPageModule = () => {
  const { data: history } = useQuery<{ items: THistoryNote[]; total: number }>({
    queryKey: ['history'],
    queryFn: queryFn('getUsageHistory', {
      offset: 0,
      limit: 3,
    }),
  })

  return history?.total ? (
    <div className="flex w-full flex-col items-center gap-2.5 border-t-[1px] border-t-(--color-opposite-text)/40 pt-2.5 dark:border-t-(--color-main-text)/10">
      <Accordion type="single" collapsible className="flex w-full flex-col gap-2.5">
        {history.items.map((note) => (
          <HistoryNote key={note.id} note={note} />
        ))}
      </Accordion>
      <Link
        to="/history"
        className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-(--color-opposite-text)/30 py-1.5 transition hover:bg-(--color-opposite-text)/50 dark:bg-(--color-main-text)/5 dark:hover:bg-(--color-main-text)/15"
      >
        View history
      </Link>
    </div>
  ) : null
}

export default HistoryMainPageModule
