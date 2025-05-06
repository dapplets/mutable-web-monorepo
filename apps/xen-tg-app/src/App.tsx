import { Link } from 'react-router'
import SettingsIcon from './assets/settings'
import XEN_IMAGE from './assets/xen-anime-style-portrait.png'
import Capabilities from './components/Capabilities'
import Layout from './components/Layout'
import Wallet from './components/Wallet'
import { HistoryCard } from './components/HistoryNote'
import ArrayRightIcon from './assets/array-right'

function App() {
  return (
    <Layout>
      <Link
        to="/settings"
        className="absolute top-5 right-4 rounded-full border border-[#f8f9ff19] bg-(--color-light-white-bg) p-2 backdrop-blur-3xl backdrop-opacity-80"
      >
        <SettingsIcon />
      </Link>
      <div className="z-1 m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full select-none">
        <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
      </div>
      <Wallet />
      <Link
        to="/history"
        className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] p-2.5 text-(--color-main-text) backdrop-blur-3xl backdrop-opacity-80"
      >
        <HistoryCard
          note={{
            id: '1',
            agent: {
              name: 'dapplets-fake-analysis',
              domain: 'Near AI',
            },
            datetime: '1745994770529',
            payment: {
              amount: 0.06,
              direction: 'outcome',
              isFree: true,
            },
            data: {
              input:
                'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. ',
              output:
                'Non elementum sed velit suspendisse arcu. Id sed venenatis sed tempus viverra tristique feugiat eu. Suspendisse bibendum pulvinar venenatis urna faucibus proin interdum. Urna semper nibh lorem blandit viverra fames pharetra. Venenatis nisl leo massa nullam nunc eros. Netus libero id faucibus turpis platea donec tincidunt lacus. Tincidunt eu faucibus vitae in at eleifend. Nulla amet auctor platea id sit sagittis et.',
            },
          }}
        />
        <div className="mr-6 flex cursor-pointer items-center justify-center py-1.5">
          <ArrayRightIcon />
        </div>
      </Link>
      <Capabilities />
    </Layout>
  )
}

export default App
