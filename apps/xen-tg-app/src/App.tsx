import { Link } from 'react-router'
import SettingsIcon from './assets/settings'
import XEN_IMAGE from './assets/xen-anime-style-portrait.png'
import Capabilities from './components/Capabilities'
import HistoryMainPageModule from './components/HistoryMainPageModule'
import Layout from './components/Layout'
import Wallet from './components/Wallet'

const App = () => (
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
    <HistoryMainPageModule />
    <Capabilities />
  </Layout>
)

export default App
