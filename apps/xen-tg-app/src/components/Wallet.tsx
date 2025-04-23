import { FC } from 'react'
import LogOutIcon from '../assets/log-out'
import NEAR_ICON from '../assets/near-gray.svg'
import { TXenUser } from '../types'

type TWalletProps = {
  user: TXenUser | null
}

// ToDo: remove mocked data
const MOCKED_DATA = {
  wallet: {
    address: 'ridgerock.near',
    balance: 230.26,
  },
}

const Wallet: FC<TWalletProps> = ({ user }) => {
  console.log(user)
  const isLoggedIn = !!user?.nearAccountId

  const handleConnect = () => {
    console.log('connect')
  }

  const handleDisconnect = () => {
    console.log('disconnect')
  }

  return user && isLoggedIn ? (
    <div className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] px-2.5 py-4 backdrop-blur-3xl backdrop-opacity-80">
      <div className="flex gap-3 text-[22px]/[150%] font-semibold">
        <img src={NEAR_ICON} alt="near" />
        {MOCKED_DATA.wallet.balance}
      </div>
      <div className="me-3 flex items-center gap-3 text-[22px]/[150%] font-normal">
        {user.nearAccountId}
        <button
          className="flex cursor-pointer p-1.5 text-[#7A818B] transition hover:text-(--color-main-text)"
          onClick={handleDisconnect}
        >
          <LogOutIcon />
        </button>
      </div>
    </div>
  ) : (
    <div className="z-1 flex w-full items-center justify-between gap-2.5 rounded-xl bg-(--color-my-primary-01) px-2.5 py-4">
      <div className="text-[18px]/[150%] font-semibold">No wallet connected</div>
      <button
        className="flex cursor-pointer flex-nowrap rounded-xl bg-(--color-my-primary) px-8 py-2 text-(--color-opposite-text) dark:bg-[#f8f9ff] dark:text-(--color-opposite-text)"
        onClick={handleConnect}
      >
        Connect
      </button>
    </div>
  )
}

export default Wallet
