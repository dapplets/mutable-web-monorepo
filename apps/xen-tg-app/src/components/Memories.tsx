import { TMemory } from '../types'
import Header from './Header'
import Layout from './Layout'
import Memory from './Memory'
import { useQuery } from '@tanstack/react-query'

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

const Memories = () => {
  const tgDataStr = window.Telegram.WebApp.initData
  const tgDataObj = window.Telegram.WebApp.initDataUnsafe
  const { data: memories } = useQuery<{ items: TMemory[]; total: number }>({
    queryKey: ['memories', tgDataStr, tgDataObj],
    queryFn: queryFn(tgDataStr, tgDataObj, 'getMemories', {
      offset: 0,
      limit: 10,
    }),
  })

  const handleDeleteAll = () => {
    console.log('delete all')
  }

  return (
    <Layout>
      <Header />
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
        <div className="my-1.5 flex w-full items-center justify-between">
          <h1 className="text-center text-2xl font-bold">{`Memories (${memories?.total})`}</h1>
          <button
            className="flex cursor-pointer px-2.5 py-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
            onClick={handleDeleteAll}
          >
            Clear all
          </button>
        </div>
        {memories?.items.map((memory) => <Memory key={memory.data} memory={memory} />)}
      </div>
    </Layout>
  )
}

export default Memories
