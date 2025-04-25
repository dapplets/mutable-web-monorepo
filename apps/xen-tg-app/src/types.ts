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
  source: string
  status: string
}

export type TWarning = {
  text: string
  timestamp: string
}

export type TMemory = {
  data: string
  datetime: string
}
