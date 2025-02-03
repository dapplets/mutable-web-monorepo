import { EventEmitter as NEventEmitter } from 'events'

export interface Subscription {
  remove: () => void
}

export class EventService<Events extends Record<string, any>> {
  constructor(public emitter: NEventEmitter = new NEventEmitter()) {}

  on<Event extends keyof Events>(
    eventName: Event,
    callback: (event: Events[Event]) => void
  ): Subscription {
    this.emitter.on(eventName as string, callback)

    return {
      remove: () => this.emitter.off(eventName as string, callback),
    }
  }

  off<Event extends keyof Events>(eventName: Event, callback: (event: Events[Event]) => void) {
    this.emitter.off(eventName as string, callback)
  }

  emit<Event extends keyof Events>(eventName: Event, event: Events[Event]) {
    this.emitter.emit(eventName as string, event)
  }
}
