import { useEffect, useState } from 'react'
import XEN_IMAGE from './assets/xen-girl-001.png'
import Capabilities from './components/Capabilities'
import DeveloperMode from './components/DeveloperMode'
import FooterMenu from './components/FooterMenu'
import Layout from './components/Layout'
import ThemeButton from './components/ThemeButton'
import Wallet from './components/Wallet'
import Warnings from './components/Warnings'
import { TUserInfo } from './types'

function App() {
  const [user, setUserInfo] = useState<TUserInfo | null>(null)

  useEffect(() => {
    const tg = window?.Telegram?.WebApp
    console.log(tg)
    const userInfo = tg?.initDataUnsafe?.user
    console.log(userInfo)
    setUserInfo(
      userInfo
        ? {
            id: userInfo.id,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            username: userInfo.username,
          }
        : null
    )
  }, [])

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
