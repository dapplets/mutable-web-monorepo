/**
 * Based on: https://github.com/near/wallet-selector/blob/594f530bf729b6c3d2f72a42612345e40654a9be/packages/core/src/lib/services/event-emitter/event-emitter.service.ts
 */
export interface Subscription {
    remove: () => void;
}
export interface EventEmitterService<Events extends Record<string, unknown>> {
    on<EventName extends keyof Events>(eventName: EventName, callback: (event: Events[EventName]) => void): Subscription;
    off<EventName extends keyof Events>(eventName: EventName, callback: (event: Events[EventName]) => void): void;
    emit<EventName extends keyof Events>(eventName: EventName, event: Events[EventName]): void;
}
export declare class EventEmitter<Events extends Record<string, unknown>> implements EventEmitterService<Events> {
    private emitter;
    on<Event extends keyof Events>(eventName: Event, callback: (event: Events[Event]) => void): Subscription;
    off<Event extends keyof Events>(eventName: Event, callback: (event: Events[Event]) => void): void;
    emit<Event extends keyof Events>(eventName: Event, event: Events[Event]): void;
}
//# sourceMappingURL=event-emitter.d.ts.map