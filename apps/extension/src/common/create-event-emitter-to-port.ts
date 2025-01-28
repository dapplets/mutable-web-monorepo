import browser from 'webextension-polyfill'
import { WildcardEventEmitter } from './wildcard-event-emitter'

export const createEventEmitterToPort = (port: browser.Runtime.Port) => {
  const eventEmitter = new WildcardEventEmitter()

  const listener = (event: string, ...args: any[]) => {
    port.postMessage({ type: 'emitEvent', data: { event, args } })
  }

  eventEmitter.on('*', listener)

  const handleDisconnect = () => {
    eventEmitter.off('*', listener)
    port.onDisconnect.removeListener(handleDisconnect)
  }

  port.onDisconnect.addListener(handleDisconnect)

  return { eventEmitter, destroy: () => handleDisconnect() }
}
