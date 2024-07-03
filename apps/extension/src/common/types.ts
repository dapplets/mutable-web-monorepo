import { Runtime } from 'webextension-polyfill'

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type MessageWrapperRequest = {
  request: {
    handler: string
    type: string
    payload: {
      path: string
      args: JsonValue[]
    }
  }
  sender: Runtime.MessageSender
}
