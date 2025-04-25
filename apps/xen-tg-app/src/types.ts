export type TUserInfo = {
  id: number
  firstName: string
  lastName?: string
  username?: string
}

export type TXenUser = {
  id: number
  firstName: string
  nearAccountId: string
  isDeveloper: boolean
}

export type Balance = {
  balance: {
    total: number
    stateStacked: number
    staked: number
    available: number
  }
  formatted: {
    total: number
    stateStacked: number
    staked: number
    available: number
  }
}

export type TAgent = {
  name: string
  domain: string
  isEnabled: boolean
}

export type TWarning = {
  title: string
  description: string
  createdAt: string
}

export type TMemory = {
  id: string
  data: string
  datetime: string
}
