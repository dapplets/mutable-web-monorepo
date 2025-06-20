import { Link } from 'react-router'
import SettingsIcon from './assets/settings'
import XEN_IMAGE from '/xen.png'
import Capabilities from './components/Capabilities'
import Layout from './components/Layout'
import Wallet from './components/Wallet'

const App = () => {
  const tg = window.Telegram.WebApp
  if (!tg.isExpanded) tg.expand()

  return (
    <Layout>
      <Link
        to="/settings"
        className="absolute top-5 right-4 rounded-full border border-(--color-opposite-text) bg-(--color-light-white-bg) p-2 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30"
      >
        <SettingsIcon />
      </Link>
      <div className="z-1 m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full border border-(--color-opposite-text) select-none dark:border-(--color-main-text)/30">
        <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
      </div>
      <Wallet />
      <Capabilities />
    </Layout>
  )
}

export default App
