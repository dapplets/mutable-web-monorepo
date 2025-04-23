import { ThemeProvider } from '@/components/theme-provider'
import { useEffect, useState } from 'react'
import XEN_IMAGE from './assets/xen-girl-001.png'
import AnimatedBackground from './components/AnimatedBackground'
import Capabilities from './components/Capabilities'
import DeveloperMode from './components/DeveloperMode'
import Memories from './components/Memories'
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
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AnimatedBackground />
      <div className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-[var(--color-main-text)]">
        <div className="absolute top-5 right-4">
          <ThemeButton />
        </div>
        <div className="m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full select-none">
          <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
        </div>
        <Wallet user={user} />
        <Capabilities user={user} />
        <DeveloperMode />
        <Warnings user={user} />
        <Memories user={user} />
      </div>
    </ThemeProvider>
  )
}

export default App
