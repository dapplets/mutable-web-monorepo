import { API_URL } from '@/env'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { TMemory } from '../types'
import DeveloperMode from './DeveloperMode'
import Header from './Header'
import Layout from './Layout'
import ThemeButton from './ThemeButton'
import Warnings from './Warnings'

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

const Settings = () => {
  const { data: memories } = useQuery<{ items: TMemory[]; total: number }>({
    queryKey: ['memories'],
    queryFn: queryFn('getMemories', {
      offset: 0,
      limit: 0,
    }),
  })

  return (
    <Layout>
      <Header />
      <ThemeButton />
      <DeveloperMode />
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] px-2.5 py-2 backdrop-blur-3xl backdrop-opacity-80">
        <div className="z-1 flex w-full items-center justify-between">
          <span className="p-2.5 text-[18px]/[150%] font-normal text-(--color-main-text)">
            Memories ({memories?.total ?? '-'})
          </span>
          <Link
            to="/memories"
            className="flex cursor-pointer flex-nowrap items-center justify-center rounded-xl bg-(--color-my-primary) px-5 py-2 text-(--color-opposite-text) dark:bg-[#f8f9ff] dark:text-(--color-opposite-text)"
          >
            Manage
          </Link>
        </div>
      </div>
      <Warnings />
    </Layout>
  )
}

export default Settings
