import { useQuery } from '@tanstack/react-query'
import XEN_IMAGE from './assets/xen-anime-style-portrait.png'
import Capabilities from './components/Capabilities'
import DeveloperMode from './components/DeveloperMode'
import FooterMenu from './components/FooterMenu'
import Layout from './components/Layout'
import ThemeButton from './components/ThemeButton'
import Wallet from './components/Wallet'
import Warnings from './components/Warnings'
import { TMemory, TXenUser } from './types'

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

function App() {
  const tgDataStr = window.Telegram.WebApp.initData
  const tgDataObj = window.Telegram.WebApp.initDataUnsafe
  const {
    isPending: isPendingUser,
    isError: isErrorUser,
    data: user,
    error: errorUser,
  } = useQuery<TXenUser>({
    queryKey: ['user', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getCurrentUser'),
  })
  const { data: memories } = useQuery<{ items: TMemory[]; total: number }>({
    queryKey: ['memories', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getMemories', {
      offset: 0,
      limit: 10,
    }),
  })

  if (isPendingUser) {
    return <span>Loading...</span>
  }

  if (isErrorUser) {
    return <span>Error: {errorUser.message}</span>
  }

  return (
    <Layout>
      <div className="absolute top-5 right-4">
        <ThemeButton />
      </div>
      <div className="z-1 m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full select-none">
        <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
      </div>
      <Wallet user={user} />
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
