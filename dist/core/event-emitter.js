"use strict";
/**
 * Based on: https://github.com/near/wallet-selector/blob/594f530bf729b6c3d2f72a42612345e40654a9be/packages/core/src/lib/services/event-emitter/event-emitter.service.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
const events_1 = require("events");
class EventEmitter {
    constructor() {
        this.emitter = new events_1.EventEmitter();
    }
    on(eventName, callback) {
        this.emitter.on(eventName, callback);
        return {
            remove: () => this.emitter.off(eventName, callback),
        };
    }
    off(eventName, callback) {
        this.emitter.off(eventName, callback);
    }
    emit(eventName, event) {
        this.emitter.emit(eventName, event);
    }
}
exports.EventEmitter = EventEmitter;
