import { useQuery } from '@tanstack/react-query'
import XEN_IMAGE from './assets/xen-girl-001.png'
import Capabilities from './components/Capabilities'
import DeveloperMode from './components/DeveloperMode'
import FooterMenu from './components/FooterMenu'
import Layout from './components/Layout'
import ThemeButton from './components/ThemeButton'
import Wallet from './components/Wallet'
import Warnings from './components/Warnings'
import { TXenUser } from './types'

function App() {
  const {
    isPending,
    isError,
    data: user,
    error,
  } = useQuery<TXenUser>({
    queryKey: ['user'],
    queryFn: async () => {
      if (!window.Telegram.WebApp.initData) {
        throw new Error('Telegram is not available')
      }
      const headers = {
        Authorization: `Bearer ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`,
        'Content-Type': 'application/json',
      }
      const response = await fetch('https://n8n.aigency.test.dapplets.org/webhook/rpc', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getCurrentUser',
          params: {},
          id: 1,
        }),
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      return data.result
    },
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
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
      <Capabilities user={user} />
      <DeveloperMode />
      <Warnings user={user} />
      <div className="fixed top-[calc(100vh-94px)] left-1/2 z-1 -translate-x-1/2">
        <FooterMenu memoriesNumber={3} />
      </div>
    </Layout>
  )
}

export default App
