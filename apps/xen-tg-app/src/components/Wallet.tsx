import { FC } from 'react'
import { TUserInfo } from '../types'
import NEAR_ICON from '../assets/near-gray.svg'
import LogOutIcon from '../assets/log-out'

type TWalletProps = {
  user: TUserInfo | null
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
  const isLoggedIn = true

  const handleConnect = () => {
    console.log('connect')
  }

  const handleDisconnect = () => {
    console.log('disconnect')
  }

  return isLoggedIn ? (
    <div className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#f8f9ff66] px-2.5 py-4">
      <div className="flex gap-3 text-[22px]/[150%] font-semibold">
        <img src={NEAR_ICON} alt="near" />
        {MOCKED_DATA.wallet.balance}
      </div>
      <div className="flex items-center gap-3 text-[22px]/[150%] font-normal">
        {MOCKED_DATA.wallet.address}
        <button
          className="flex cursor-pointer text-[#7A818B] transition hover:text-(--color-white-text)"
          onClick={handleDisconnect}
        >
          <LogOutIcon />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex w-full items-center justify-between gap-2.5 rounded-xl bg-[#f8f9ff19] px-2.5 py-4">
      <div className="text-[18px]/[150%] font-semibold">No wallet connected</div>
      <button
        className="flex cursor-pointer flex-nowrap rounded-xl bg-[#f8f9ff] px-8 py-2 text-(--color-black-text)"
        onClick={handleConnect}
      >
        Connect
      </button>
    </div>
  )
}

export default Wallet
