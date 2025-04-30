import { useQuery } from '@tanstack/react-query'
import XEN_IMAGE from './assets/xen-anime-style-portrait.png'
import Capabilities from './components/Capabilities'
import DeveloperMode from './components/DeveloperMode'
import FooterMenu from './components/FooterMenu'
import Layout from './components/Layout'
import ThemeButton from './components/ThemeButton'
import Wallet from './components/Wallet'
import Warnings from './components/Warnings'
import { TMemory } from './types'
import { API_URL } from './env'

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

function App() {
  const { data: memories } = useQuery<{ items: TMemory[]; total: number }>({
    queryKey: ['memories'],
    queryFn: queryFn('getMemories', {
      offset: 0,
      limit: 10,
    }),
  })

  return (
    <Layout>
      <div className="absolute top-5 right-4">
        <ThemeButton />
      </div>
      <div className="z-1 m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full select-none">
        <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
      </div>
      <Wallet />
      <Capabilities />
      <DeveloperMode />
      <Warnings />
      <div className="fixed top-[calc(100vh-94px)] left-1/2 z-1 -translate-x-1/2">
        <FooterMenu memoriesNumber={memories?.total} />
      </div>
    </Layout>
  )
}

export default App
