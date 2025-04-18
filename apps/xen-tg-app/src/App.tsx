import { useEffect, useState } from 'react'
import './App.css'
import XEN_IMAGE from './assets/xen-girl-001.png'
import Agents from './components/Agents'
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
    <>
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
          <div className="interactive"></div>
        </div>
      </div>
      <div className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-[var(--color-white-text)]">
        <div className="m-2.5 flex w-[210px] justify-center overflow-hidden rounded-full">
          <img src={XEN_IMAGE} alt="xen-photo" className="h-full w-full" />
        </div>
        {/* <h1 className="text-center text-3xl font-bold">Welcome to Xen Telegram App</h1> */}
        {/* {user ? (
          <div className="flex flex-col items-center justify-center gap-2 p-7">
            <p className="text-center">
              <strong>ID:</strong> {user.id}
            </p>
            <p className="text-center">
              <strong>First Name:</strong> {user.firstName}
            </p>
            <p className="text-center">
              <strong>Last Name:</strong> {user.lastName ? user.lastName : '-'}
            </p>
            <p className="text-center">
              <strong>Username:</strong> {user.username ? user.username : '-'}
            </p>
          </div>
        ) : (
          <p className="text-center">User information is not available.</p>
        )} */}
        <Wallet user={user} />
        <Agents user={user} />
        <Warnings user={user} />
      </div>
    </>
  )
}

export default App
