import React, { Dispatch, SetStateAction } from 'react'
import { DropdownAccounts } from './dropdown-accounts'
import { WalletDescriptorWithCAMainStatus } from './types'

type TDropdownCAListReceiverProps = {
  values: WalletDescriptorWithCAMainStatus[]
  selected?: WalletDescriptorWithCAMainStatus
  setter: Dispatch<SetStateAction<WalletDescriptorWithCAMainStatus | null>>
  maxLength?: number
}

export const DropdownCAListReceiver = (props: TDropdownCAListReceiverProps) => {
  const { values, selected, setter, maxLength } = props

  return (
    <DropdownAccounts<WalletDescriptorWithCAMainStatus>
      values={values}
      selected={selected}
      setter={setter}
      nameId="account"
      originId="chain"
      maxLength={maxLength}
    />
  )
}
