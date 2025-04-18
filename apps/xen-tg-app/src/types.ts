export type TUserInfo = {
  id: number
  firstName: string
  lastName?: string
  username?: string
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
  text: string
  timestamp: string
}
