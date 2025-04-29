import SyncIcon from '@/assets/sync'
import { TNewsSource } from '../types'
import Header from './Header'
import Layout from './Layout'
import NewsSource from './NewsSource'
import Spinner from './Spinner'
import PlusIcon from '@/assets/plus'
import RedditIcon from '@/assets/reddit.svg'

const MOCKED_DATA: { total: number; items: TNewsSource[] } = {
  items: [
    {
      name: 'r/SomeNewSource',
    },
    {
      name: 'r/Cryptocurrency1',
      domain: 'Reddit',
      isEnabled: true,
      icon: RedditIcon,
    },
    {
      name: 'r/Cryptocurrency2',
      domain: 'Reddit',
      isEnabled: false,
      icon: RedditIcon,
    },
    {
      name: 'r/Cryptocurrency3',
      domain: 'Reddit',
      isEnabled: true,
      icon: RedditIcon,
    },
    {
      name: 'r/Cryptocurrency4',
      domain: 'Reddit',
      isEnabled: true,
      icon: RedditIcon,
    },
  ],
  total: 5,
}

const NewsMonitor = () => {
  const handleAddSource = () => {
    console.log('handleAddSource')
  }

  const isPending = false // ToDo: hardcoded

  return (
    <Layout>
      <Header />
      <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 backdrop-blur-3xl backdrop-opacity-80">
        <div className="my-1.5 flex w-full items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-center text-2xl font-bold">News Monitor</h1>
            <div className="flex items-center justify-center gap-1 text-[12px]/[150%] text-[#7A818B]">
              Next scan:{' '}
              <span className="flex items-center justify-center font-semibold text-(--my-primary)">
                {' '}
                in 58 min <SyncIcon />
              </span>
            </div>
          </div>
          <button
            className="mr-3.5 flex cursor-pointer items-center justify-center p-1.5 text-[#7A818B] transition hover:not-disabled:text-(--color-main-text)"
            onClick={handleAddSource}
          >
            {isPending ? <Spinner /> : <PlusIcon />}
          </button>
        </div>
        {MOCKED_DATA?.items.map((newsSource) => (
          <NewsSource key={newsSource.name} newsSource={newsSource} />
        ))}
      </div>
    </Layout>
  )
}

export default NewsMonitor
