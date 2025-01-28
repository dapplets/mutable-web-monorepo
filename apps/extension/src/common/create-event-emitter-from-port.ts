import browser from 'webextension-polyfill'
import { WildcardEventEmitter } from './wildcard-event-emitter'

export const createEventEmitterFromPort = (port: browser.Runtime.Port) => {
  const eventEmitter = new WildcardEventEmitter()

  const portMessageListener = (message: any) => {
    if (message.type === 'emitEvent') {
      eventEmitter.emit(message.data.event, ...message.data.args)
    }
  }

  port.onMessage.addListener(portMessageListener)

  const handleDisconnect = () => {
    port.onMessage.removeListener(portMessageListener)
    port.onDisconnect.removeListener(handleDisconnect)
  }

  port.onDisconnect.addListener(handleDisconnect)

  return { eventEmitter, destroy: () => handleDisconnect() }
}
