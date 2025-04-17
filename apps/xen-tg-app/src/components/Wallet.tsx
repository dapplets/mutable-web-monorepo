import { FC } from 'react'
import { TUserInfo } from '../types'

type TWalletProps = {
  user: TUserInfo | null
}

// const MOCKED_DATA = {
//   wallet: {
//     address: 'ridgerock.near',
//     balance: 230.26,
//   },
// }

const Wallet: FC<TWalletProps> = ({ user }) => {
  console.log(user)
  return <div>Wallet</div>
}

export default Wallet
