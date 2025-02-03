import browser from 'webextension-polyfill'
import { WildcardEventEmitter } from './wildcard-event-emitter'

export const connectEventEmitterWithPort = (
  port: browser.Runtime.Port,
  eventEmitter: WildcardEventEmitter
) => {
  const portMessageListener = (message: any) => {
    if (message.type === 'emitEvent') {
      eventEmitter.emitQuitely(message.data.event, ...message.data.args)
    }
  }

  port.onMessage.addListener(portMessageListener)

  const listener = (event: string, ...args: any[]) => {
    port.postMessage({ type: 'emitEvent', data: { event, args } })
  }

  eventEmitter.on('*', listener)

  const handleDisconnect = () => {
    eventEmitter.off('*', listener)
    port.onMessage.removeListener(portMessageListener)
    port.onDisconnect.removeListener(handleDisconnect)
  }

  port.onDisconnect.addListener(handleDisconnect)

  return { disconnect: () => handleDisconnect() }
}
