import { EventEmitter as NEventEmitter } from 'events'

export class WildcardEventEmitter extends NEventEmitter {
  emit(event: string, ...args: any[]): boolean {
    super.emit('*', event, ...args)
    return super.emit(event, ...args)
  }
}
