/**
 * Based on: https://github.com/near/wallet-selector/blob/594f530bf729b6c3d2f72a42612345e40654a9be/packages/core/src/lib/services/event-emitter/event-emitter.service.ts
 */

import { EventEmitter as NEventEmitter } from 'events'

export interface Subscription {
  remove: () => void
}

export interface EventEmitterService<Events extends Record<string, unknown>> {
  on<EventName extends keyof Events>(
    eventName: EventName,
    callback: (event: Events[EventName]) => void
  ): Subscription

  off<EventName extends keyof Events>(
    eventName: EventName,
    callback: (event: Events[EventName]) => void
  ): void

  emit<EventName extends keyof Events>(eventName: EventName, event: Events[EventName]): void
}

export class EventEmitter<Events extends Record<string, unknown>>
  implements EventEmitterService<Events>
{
  private emitter = new NEventEmitter()

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
