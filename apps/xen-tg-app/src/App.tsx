import { useState } from 'react'
import { useNavigate } from 'react-router'
import SettingsIcon from './assets/settings'
import Capabilities from './components/Capabilities'
import Spinner from './components/Spinner'
import Wallet from './components/Wallet'
import XEN_IMAGE from '/xen.png'

const App = () => {
  const [isWaiting, setIsWaiting] = useState(false)
  const navigate = useNavigate()
  const tg = window.Telegram.WebApp
  if (!tg.isExpanded) tg.expand()

  return (
    <>
      <button
        role="link"
        onClick={() => {
          setIsWaiting(true)
          navigate('/settings')
        }}
        disabled={isWaiting}
        className="absolute top-5 right-4 h-9.5 w-9.5 rounded-full border border-(--color-opposite-text) bg-(--color-light-white-bg) p-2 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30"
      >
        {isWaiting ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <SettingsIcon />
        )}
      </button>
      <div className="z-1 m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full border border-(--color-opposite-text) select-none dark:border-(--color-main-text)/30">
        <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
      </div>
      <Wallet />
      <Capabilities />
    </>
  )
}

export default App
