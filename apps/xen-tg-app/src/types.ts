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
  action?: () => void
}

export type TNewsSource = {
  name: string
  domain?: string
  isEnabled?: boolean
  icon?: string
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

export type THistoryNote = {
  id: string
  agent: Omit<TAgent, 'isEnabled'>
  datetime: string
  payment: {
    amount: number
    direction: 'income' | 'outcome'
    isFree: boolean
  }
  data: {
    input: string
    output: string
  }
}
