import { useEffect, useState } from 'react'
import './App.css'

type TUserInfo = {
  id: number
  firstName: string
  lastName?: string
  username?: string
}

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
    <div className="flex flex-col gap-6 p-7 justify-center items-center">
      <h1 className="text-3xl font-bold">Welcome to Xen Telegram App</h1>
      {user ? (
        <div className="flex flex-col gap-2 p-7 justify-center items-center">
          <p>
            <strong>ID:</strong> ${user.id}
          </p>
          <p>
            <strong>First Name:</strong> ${user.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> ${user.lastName ? user.lastName : '-'}
          </p>
          <p>
            <strong>Username:</strong> ${user.username ? user.username : '-'}
          </p>
        </div>
      ) : (
        <p>User information is not available.</p>
      )}
    </div>
  )
}

export default App
