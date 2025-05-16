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
  id: string
  name: string
  domain: string
  title: string | null
  description: string | null
  isEnabled: boolean
}

export type TSubscription = {
  id: number
  link: string
  source: string
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

export type THistoryNote = {
  id: number
  capabilityDomain: string
  capabilityName: string
  amount: string
  operationType: 'income' | 'outcome'
  executionInput: string
  executionOutput: string
  createdAt: string
  isFree?: boolean
}

export type RewardAmount = {
  total: string
  availableToClaim: string
}
